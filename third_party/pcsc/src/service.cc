#include <algorithm>
#include <chrono>
#include <node.h>
#include <node_buffer.h>

#include "common.h"
#include "service.h"

namespace pcsc {
    Service::Service() {}

    Service::~Service() {}

    void Service::Init(v8::Local<v8::Object> exports) {
        v8::Isolate* isolate = exports->GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        /** Wrap Service class. */
        v8::Local<v8::ObjectTemplate> objTpl = v8::ObjectTemplate::New(isolate);
        objTpl->SetInternalFieldCount(1);

        v8::Local<v8::Object> obj = objTpl->NewInstance(context).ToLocalChecked();
        v8::Local<v8::FunctionTemplate> fn = v8::FunctionTemplate::New(isolate, pcsc::Service::New, obj);

        fn->SetClassName(v8::String::NewFromUtf8(isolate, "Service").ToLocalChecked());
        fn->InstanceTemplate()->SetInternalFieldCount(2);

        NODE_SET_PROTOTYPE_METHOD(fn, "on", pcsc::Service::On);
        NODE_SET_PROTOTYPE_METHOD(fn, "update", pcsc::Service::Update);

        v8::Local<v8::Function> ctor = fn->GetFunction(context).ToLocalChecked();
        obj->SetInternalField(0, ctor);

        exports->Set(context, v8::String::NewFromUtf8(isolate, "service").ToLocalChecked(), ctor).FromJust();
    }

    void Service::New(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();

        if (!args.IsConstructCall()) {
            THROW(isolate, "failed to construct 'Service'");
        }

        /** Set seed. */
        srand(time(NULL));

        Service* obj = new Service();
        obj->Wrap(args.This());
        args.GetReturnValue().Set(args.This());
    }

    void Service::Update(const v8::FunctionCallbackInfo<v8::Value>& args) {
        LONG lResult = 0;
        SCARDCONTEXT hContext = 0;
        SCARDHANDLE hCard = 0;
        LPSTR pmszReaders = NULL;
        LPSTR lpReader = NULL;
        DWORD dwReaders = 0;
        DWORD dwActiveProtocol = 0;
        char lpReaderName[MAX_READER_NAME] = { 0 };
        DWORD dwReaderName = MAX_READER_NAME - 1;
        DWORD dwState = 0;
        DWORD dwProtocol = 0;
        BYTE pbAtr[MAX_ATR_STRING] = { 0 };
        DWORD dwAtrLen = MAX_ATR_STRING;

        v8::Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Service* obj = node::ObjectWrap::Unwrap<Service>(args.Holder());

        /** Start update. */
        std::chrono::high_resolution_clock::time_point t1 = std::chrono::high_resolution_clock::now();

        /** Connect to Resource Manager */
        lResult = SCardEstablishContext(SCARD_SCOPE_SYSTEM, NULL, NULL, &hContext);
        if (lResult != SCARD_S_SUCCESS) {
            THROW(isolate, "connect to resource manager failed, status=0x%x", (int)lResult);
        }

        /** Generate new nonce. */
        while (true) {

            /** Get random number. */
            int nonce = rand();

            /** Make sure nonce is valid. */
            if (nonce != obj->nonce) {
                obj->nonce = nonce;
                break;
            }
        }

        /** Get readers */
#ifdef SCARD_AUTOALLOCATE
        dwReaders = SCARD_AUTOALLOCATE;
        lResult = SCardListReaders(hContext, NULL, (LPSTR)&pmszReaders, &dwReaders);
#else
        /** Get readers list size. */
        lResult = SCardListReaders(hContext, NULL, NULL, &dwReaders);
        SCARD_CHECKRET(isolate, hContext, lResult, "retrieve size of readers list failed, status=0x%x", (int)lResult);

        /** Alloc readers list. */
        pmszReaders = (LPSTR)calloc(dwReaders, sizeof(char));

        /** Retrieve readers list. */
        lResult = SCardListReaders(hContext, NULL, pmszReaders, &dwReaders);
#endif // SCARD_AUTOALLOCATE

        switch (lResult & 0x8fffffff) {
        case SCARD_S_SUCCESS:
            break;
        case SCARD_E_NO_READERS_AVAILABLE: {
            /** Remove all reader */
            for (auto it = obj->readers.begin(); it != obj->readers.end(); it = obj->readers.erase(it)) {
                LOG("remove reader %s\n", (*it)->name);
                delete* it;
            }
            return;
        }
        default:
            SCARD_CHECKRET(isolate, hContext, lResult, "retrieve readers list failed, status=0x%x", (int)lResult);
        }

        /** Update readers */
        lpReader = pmszReaders;
        while (*lpReader != '\0') {

            /** Find device in vector. */
            auto find = std::find_if(obj->readers.begin(), obj->readers.end(), [&](const Device* x) {
                return strcmp(x->name, lpReader) == 0;
                });

            /** Reader not in list */
            if (find == obj->readers.end()) {
                LOG("push_back reader %s\n", lpReader);
                obj->readers.push_back(new Device(lpReader, obj->nonce));
            }

            /** Reader already in list. */
            else {
                LOG("update reader %s\n", (*find)->name);
                (*find)->nonce = obj->nonce;
            }

            /** Next reader */
            lpReader += (strlen(lpReader) + 1);
        }

        /** Update cards */
        for (auto it = obj->readers.begin(); it != obj->readers.end();) {

            /** Remove outofdate reader. */
            if (!(*it)->Validate(obj->nonce)) {
                delete* it;
                it = obj->readers.erase(it);
                continue;
            }

            /** Connect to card. */
            lResult = SCardConnect(hContext, (*it)->name, SCARD_SHARE_SHARED, SCARD_PROTOCOL_T0 | SCARD_PROTOCOL_T1, &hCard, &dwActiveProtocol);
            switch (lResult & 0x8fffffff) {
            case SCARD_S_SUCCESS:
                break;
            case SCARD_E_NO_SMARTCARD:
            case SCARD_W_REMOVED_CARD:
                it++;
                continue;
            default:
                SCARD_CHECKRET(isolate, hContext, lResult, "connect to reader failed, status=0x%x", (int)lResult);
            }

            /** Get card status. */
            lResult = SCardStatus(hCard, lpReaderName, &dwReaderName, &dwState, &dwProtocol, pbAtr, &dwAtrLen);
            SCARD_CHECKRET(isolate, hContext, lResult, "get status from reader failed, status=0x%x", (int)lResult);

            /** Card object. */
            v8::Local<v8::Object> card = v8::Object::New(isolate);

            /** Create key for card object. */
            v8::Local<v8::String> kName = v8::String::NewFromUtf8(isolate, "name").ToLocalChecked();
            v8::Local<v8::String> kAtr = v8::String::NewFromUtf8(isolate, "atr").ToLocalChecked();
            // v8::Local<v8::String> kStatus = v8::String::NewFromUtf8(isolate, "status").ToLocalChecked();

            /** Create card object. */
            card->Set(context, kName, v8::String::NewFromUtf8(isolate, lpReaderName).ToLocalChecked()).Check();
            card->Set(context, kAtr, node::Buffer::Copy(isolate, (const char*)pbAtr, dwAtrLen).ToLocalChecked()).Check();
            // card->Set(context, kStatus, v8::String::NewFromUtf8(isolate, "attach").ToLocalChecked()).Check();

            /** Prepare callback parameters. */
            const unsigned int argc = 1;
            v8::Local<v8::Value> argv[argc] = { card };

            /** Invoke callbacks.*/
            for (auto& it : obj->cardListeners) {
                v8::Local<v8::Function>::New(isolate, it)->Call(context, v8::Null(isolate), argc, argv).ToLocalChecked();
            }

            /** Leave card. */
            lResult = SCardDisconnect(hCard, SCARD_LEAVE_CARD);
            SCARD_CHECKRET(isolate, hContext, lResult, "leave card failed, status=0x%x", (int)lResult);

            it++;
        }

        /** Release readers list. */
#ifdef SCARD_AUTOALLOCATE
        lResult = SCardFreeMemory(hContext, pmszReaders);
        SCARD_CHECKRET(isolate, hContext, lResult, "release readers list failed, status=0x%x", (int)lResult);
#else
        if (pmszReaders != NULL) {
            free(pmszReaders);
        }
#endif // SCARD_AUTOALLOCATE

        /** Release scard context. */
        lResult = SCardReleaseContext(hContext);
        if (lResult != SCARD_S_SUCCESS) {
            THROW(isolate, "release context failed, status=0x%x", (int)lResult);
        }

        /** Prepare callback parameters. */
        long long time = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - t1).count();
        const unsigned int argc = 1;
        v8::Local<v8::Value> argv[argc] = { v8::Number::New(isolate, time) };

        /** Invoke callbacks.*/
        for (auto& it : obj->updateListeners) {
            v8::Local<v8::Function>::New(isolate, it)->Call(context, v8::Null(isolate), argc, argv).ToLocalChecked();
        }
    }

    void Service::On(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        /** Validate parameters. */
        if (args.Length() < 2) {
            THROW(isolate, "missing argument");
        }

        if (!args[0]->IsString()) {
            THROW(isolate, "invalid event name type");
        }

        if (!args[1]->IsFunction()) {
            THROW(isolate, "invalid event listener type");
        }

        v8::String::Utf8Value lpEventName(isolate, args[0]->ToString(context).ToLocalChecked());
        v8::Persistent<v8::Function, v8::CopyablePersistentTraits<v8::Function>> listener;
        listener.Reset(isolate, v8::Local<v8::Function>::Cast(args[1]));

        Service* obj = node::ObjectWrap::Unwrap<Service>(args.Holder());
        char* evt = *lpEventName;

        /** Add card attach event. */
        if (strcmp(evt, "card") == 0) {
            obj->cardListeners.push_back(listener);
            return;
        }

        /** Add error event. */
        if (strcmp(evt, "error") == 0) {
            obj->errorListeners.push_back(listener);
            return;
        }

        /** Add update event. */
        if (strcmp(evt, "update") == 0) {
            obj->updateListeners.push_back(listener);
            return;
        }
    }
}