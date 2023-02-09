// #include <Foundation/Foundation.h>
#include <CoreFoundation/CoreFoundation.h>
#include <Security/Security.h>
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
        CFStringRef fs = CFStringCreateWithFileSystemRepresentation(kCFAllocatorSystemDefault, *fileName);
        CFURLRef path = CFURLCreateWithFileSystemPath(kCFAllocatorDefault, fs, kCFURLPOSIXPathStyle, true);
        SecStaticCodeRef codeRef;
        CFDictionaryRef api;

        v8::Local<v8::String> kVerify = v8::String::NewFromUtf8(isolate, "verified").ToLocalChecked();
        v8::Local<v8::String> kSigner = v8::String::NewFromUtf8(isolate, "signer").ToLocalChecked();

        sign->Set(context, kVerify, v8::Boolean::New(isolate, false)).Check();
        sign->Set(context, kSigner, v8::String::NewFromUtf8(isolate, "(unknown signer)").ToLocalChecked()).Check();

        if (SecStaticCodeCreateWithPath(path, kSecCSDefaultFlags, &codeRef) != errSecSuccess) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "no such file or directory.").ToLocalChecked()));
            goto clean;
        }

        SecCodeCopySigningInformation(codeRef, kSecCSInternalInformation | kSecCSSigningInformation | kSecCSRequirementInformation | kSecCSInternalInformation, &api);
        if (CFDictionaryGetValue(api, kSecCodeInfoIdentifier)) {
            CFArrayRef certChain = (CFArrayRef)CFDictionaryGetValue(api, kSecCodeInfoCertificates);
            SecCertificateRef cert = (SecCertificateRef)CFArrayGetValueAtIndex(certChain, 0);
            CFStringRef iods[] = { kSecOIDX509V1SubjectName };
            CFArrayRef keys = CFArrayCreate(kCFAllocatorDefault, (const void**)iods, sizeof(iods) / sizeof(iods[0]), &kCFTypeArrayCallBacks);

            CFDictionaryRef vals = SecCertificateCopyValues(cert, keys, NULL);
            if (vals == NULL) {
                goto clean;
            }

            CFDictionaryRef subject = (CFDictionaryRef)CFDictionaryGetValue(vals, kSecOIDX509V1SubjectName);
            if (subject == NULL) {
                goto clean;
            }

            CFArrayRef subjectValue = (CFArrayRef)CFDictionaryGetValue(subject, kSecPropertyKeyValue);
            if (subjectValue == NULL) {
                goto clean;
            }

            for (CFIndex i = 0; i < CFArrayGetCount(subjectValue); i++) {
                CFDictionaryRef dict = (CFDictionaryRef)CFArrayGetValueAtIndex(subjectValue, i);
                if (CFGetTypeID(dict) != CFDictionaryGetTypeID()) {
                    continue;
                }
                CFTypeRef iod = CFDictionaryGetValue(dict, kSecPropertyKeyLabel);
                if (CFEqual(iod, kSecOIDOrganizationName)) {
                    CFStringRef organization = (CFStringRef)CFDictionaryGetValue(dict, kSecPropertyKeyValue);
                    sign->Set(context, kVerify, v8::Boolean::New(isolate, true)).Check();
                    sign->Set(context, kSigner, v8::String::NewFromUtf8(isolate, CFStringGetCStringPtr(organization, kCFStringEncodingMacRoman)).ToLocalChecked()).Check();
                    break;
                }
            }
        }
    clean:
        args.GetReturnValue().Set(sign);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "verify", Verify);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}