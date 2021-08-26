#include <node_buffer.h>

#include "card.h"

namespace pcsc {

    Card::Card() {
        this->hContext = 0;
        this->hCard = 0;
    }

    Card::~Card() { ; }

    void Card::Init(v8::Local<v8::Object> exports) {
        v8::Isolate* isolate = exports->GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        /** Wrap Card class. */
        v8::Local<v8::ObjectTemplate> objTpl = v8::ObjectTemplate::New(isolate);
        objTpl->SetInternalFieldCount(1);

        v8::Local<v8::Object> obj = objTpl->NewInstance(context).ToLocalChecked();
        v8::Local<v8::FunctionTemplate> fn = v8::FunctionTemplate::New(isolate, pcsc::Card::New, obj);

        fn->SetClassName(v8::String::NewFromUtf8(isolate, "Card").ToLocalChecked());
        fn->InstanceTemplate()->SetInternalFieldCount(2);

        NODE_SET_PROTOTYPE_METHOD(fn, "open", pcsc::Card::Open);
        NODE_SET_PROTOTYPE_METHOD(fn, "transmit", pcsc::Card::Transmit);
        NODE_SET_PROTOTYPE_METHOD(fn, "close", pcsc::Card::Close);

        v8::Local<v8::Function> ctor = fn->GetFunction(context).ToLocalChecked();
        obj->SetInternalField(0, ctor);

        exports->Set(context, v8::String::NewFromUtf8(isolate, "card").ToLocalChecked(), ctor).FromJust();
    }

    void Card::New(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();

        if (!args.IsConstructCall()) {
            THROW(isolate, "failed to construct 'Card'");
        }

        Card* obj = new Card();
        obj->Wrap(args.This());
        args.GetReturnValue().Set(args.This());
    }

    void Card::Open(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Card* obj = node::ObjectWrap::Unwrap<Card>(args.Holder());

        LONG lResult = 0;
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

        if (args.Length() < 1) {
            THROW(isolate, "missing parameter");
        }

        if (!args[0]->IsObject()) {
            THROW(isolate, "invalid parameter");
        }

        v8::Local<v8::Object> params = args[0]->ToObject(context).ToLocalChecked();
        v8::Local<v8::String> kName = v8::String::NewFromUtf8(isolate, "name").ToLocalChecked();
        v8::Local<v8::String> kAtr = v8::String::NewFromUtf8(isolate, "atr").ToLocalChecked();
        v8::String::Utf8Value name(isolate, v8::Local<v8::String>::Cast(params->Get(context, kName).ToLocalChecked()));

        /** Open parameters. */
        char* lpName = *name;
        char* lpAtr = node::Buffer::Data(params->Get(context, kAtr).ToLocalChecked());

        LOG("name=%s\natr=", lpName);
        for (size_t i = 0; i < node::Buffer::Length(params->Get(context, kAtr).ToLocalChecked()); i++) {
            LOG("%02x ", lpAtr[i] & 0xFF);
        }
        LOG("\n");

        /** Connect to Resource Manager */
        lResult = SCardEstablishContext(SCARD_SCOPE_SYSTEM, NULL, NULL, &obj->hContext);
        if (lResult != SCARD_S_SUCCESS) {
            THROW(isolate, "connect to resource manager failed, status=0x%x", (int)lResult);
        }
        /** Get readers */
#ifdef SCARD_AUTOALLOCATE
        dwReaders = SCARD_AUTOALLOCATE;
        lResult = SCardListReaders(obj->hContext, NULL, (LPSTR)&pmszReaders, &dwReaders);
#else
        /** Get readers list size. */
        lResult = SCardListReaders(obj->hContext, NULL, NULL, &dwReaders);
        SCARD_CHECKRET(isolate, obj->hContext, lResult, "retrieve size of readers list failed, status=0x%x", (int)lResult);

        /** Alloc readers list. */
        pmszReaders = (LPSTR)calloc(dwReaders, sizeof(char));

        /** Retrieve readers list. */
        lResult = SCardListReaders(obj->hContext, NULL, pmszReaders, &dwReaders);
#endif // SCARD_AUTOALLOCATE

        switch (lResult & 0x8fffffff) {
        case SCARD_S_SUCCESS:
            break;
        case SCARD_E_NO_READERS_AVAILABLE:
            THROW(isolate, "can not found any compatible reader.");
        default:
            SCARD_CHECKRET(isolate, obj->hContext, lResult, "retrieve readers list failed, status=0x%x", (int)lResult);
        }

        /** Update readers */
        lpReader = pmszReaders;
        while (*lpReader != '\0') {
            if (strcmp(lpReader, lpName) == 0) {
                break;
            }
            lpReader += (strlen(lpReader) + 1);
        }

        /** Connect to card. */
        lResult = SCardConnect(obj->hContext, lpReader, SCARD_SHARE_SHARED, SCARD_PROTOCOL_T0 | SCARD_PROTOCOL_T1, &obj->hCard, &dwActiveProtocol);
        switch (lResult & 0x8fffffff) {
        case SCARD_S_SUCCESS:
            break;
        case SCARD_W_REMOVED_CARD:
            THROW(isolate, "card not found on reader.");
        default:
            SCARD_CHECKRET(isolate, obj->hContext, lResult, "connect to reader failed, status=0x%x", (int)lResult);
        }

        switch (dwActiveProtocol) {
        case SCARD_PROTOCOL_T0:
            obj->pIORequestPci = SCARD_PCI_T0;
            break;
        case SCARD_PROTOCOL_T1:
            obj->pIORequestPci = SCARD_PCI_T1;
            break;
        default:
            THROW(isolate, "unknown card active protocol, protocol=0x%x", (int)dwActiveProtocol);
        }

        /** Get card status. */
        lResult = SCardStatus(obj->hCard, lpReaderName, &dwReaderName, &dwState, &dwProtocol, pbAtr, &dwAtrLen);
        SCARD_CHECKRET(isolate, obj->hContext, lResult, "get status from reader failed, status=0x%x", (int)lResult);

        /** Check card atr. */
        if (memcmp(pbAtr, lpAtr, dwAtrLen) != 0) {
            THROW(isolate, "invalid card on reader");
        }

        /** Release readers list. */
#ifdef SCARD_AUTOALLOCATE
        lResult = SCardFreeMemory(obj->hContext, pmszReaders);
        SCARD_CHECKRET(isolate, obj->hContext, lResult, "release readers list failed, status=0x%x", (int)lResult);
#else
        if (pmszReaders != NULL) {
            free(pmszReaders);
        }
#endif // SCARD_AUTOALLOCATE
    }

    void Card::Transmit(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        Card* obj = node::ObjectWrap::Unwrap<Card>(args.Holder());

        LONG lResult = 0;
        DWORD dwData;
        // SCARD_IO_REQUEST IOResponsePci;
        BYTE lpRecv[1024];
        DWORD dwRecv = sizeof(lpRecv);

        /** Validate parameters. */
        if (args.Length() < 1) {
            THROW(isolate, "missing parameter.");
        }

        if (obj->hCard == 0) {
            THROW(isolate, "card not opened.");
        }

        /** Transmit data. */
        char* lpData = node::Buffer::Data(args[0]);
        dwData = node::Buffer::Length(args[0]);

        LOG("dwData=%ld\nlpData=", dwData);
        for (DWORD i = 0; i < dwData; i++) {
            LOG("%02x ", lpData[i] & 0xFF);
        }
        LOG("\n");

        LOG("transmitting...\n");

        /** Begin transaction. */
        lResult = SCardBeginTransaction(obj->hCard);
        SCARD_CHECKRET(isolate, obj->hContext, lResult, "can not begin transaction, status=0x%x", (int)lResult);

        /** Send data to card and receive response. */
        lResult = SCardTransmit(obj->hCard, obj->pIORequestPci, (LPCBYTE)lpData, dwData, NULL, (LPBYTE)lpRecv, &dwRecv);
        switch (lResult & 0x8fffffff) {
        case SCARD_E_NOT_TRANSACTED:
            /** Maybe card not support AID command. */
        case SCARD_E_NO_ACCESS:
            /** Permission denied, direct access to NFC CTAP2 device on Windows/Linux require admin/root privilege. */
            dwRecv = 0;
            break;
        default:
            SCARD_CHECKRET(isolate, obj->hContext, lResult, "can not transmit data to card, status=0x%x", (int)lResult);
        }

        /** End transaction. */
        lResult = SCardEndTransaction(obj->hCard, SCARD_LEAVE_CARD);
        SCARD_CHECKRET(isolate, obj->hContext, lResult, "can not end transaction, status=0x%x", (int)lResult);

        LOG("done\n");
        for (DWORD i = 0; i < dwRecv; i++) {
            LOG("%02x ", lpRecv[i]);
        }
        LOG("\n");

        args.GetReturnValue().Set(node::Buffer::Copy(isolate, (char*)lpRecv, dwRecv).ToLocalChecked());
    }

    void Card::Close(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        Card* obj = node::ObjectWrap::Unwrap<Card>(args.Holder());

        LONG lResult = 0;

        /** Disconnect card. */
        if (obj->hCard != 0) {
            lResult = SCardDisconnect(obj->hCard, SCARD_LEAVE_CARD);
            SCARD_CHECKRET(isolate, obj->hContext, lResult, "leave card failed, status=0x%x", (int)lResult);
            obj->hCard = 0;
        }

        /** Release scard context. */
        if (obj->hContext != 0) {
            lResult = SCardReleaseContext(obj->hContext);
            if (lResult != SCARD_S_SUCCESS) {
                THROW(isolate, "release context failed, status=0x%x", (int)lResult);
            }
            obj->hContext = 0;
        }
    }
}