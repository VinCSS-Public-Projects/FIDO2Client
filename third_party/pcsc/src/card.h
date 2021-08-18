#include <node.h>
#include <node_object_wrap.h>

#include "common.h"

namespace pcsc {
    class Card : public node::ObjectWrap {
    public:
        Card();
        ~Card();
        static void Init(v8::Local<v8::Object> exports);
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Open(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Transmit(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);

        SCARDCONTEXT hContext;
        SCARDHANDLE hCard;
        const SCARD_IO_REQUEST *pIORequestPci;
    };
}