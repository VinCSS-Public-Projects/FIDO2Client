#include <node.h>

namespace Sign {

    void Verify(const v8::FunctionCallbackInfo<v8::Value>& args) {
        v8::Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (args.Length() < 1) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "undefined file path.").ToLocalChecked()));
            return;
        }

        if (!args[0]->IsString()) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "invalid file path.").ToLocalChecked()));
            return;
        }

        v8::Local<v8::Object> sign = v8::Object::New(isolate);
        v8::String::Utf8Value fileName(isolate, args[0]->ToString(context).ToLocalChecked());

        v8::Local<v8::String> kVerify = v8::String::NewFromUtf8(isolate, "verified").ToLocalChecked();
        v8::Local<v8::String> kSigner = v8::String::NewFromUtf8(isolate, "signer").ToLocalChecked();

        sign->Set(context, kVerify, v8::Boolean::New(isolate, false)).Check();
        sign->Set(context, kSigner, v8::String::NewFromUtf8(isolate, "(unknown signer)").ToLocalChecked()).Check();

        args.GetReturnValue().Set(sign);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "verify", Verify);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}