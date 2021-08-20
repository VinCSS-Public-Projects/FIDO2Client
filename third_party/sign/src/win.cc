#include <node.h>
#include <windows.h>
#include <WinTrust.h>

#define ENCODING (X509_ASN_ENCODING | PKCS_7_ASN_ENCODING)

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
        DWORD dwEncoding, dwContentType, dwFormatType, dwData;
        HCERTSTORE hStore = NULL;
        HCRYPTMSG hMsg = NULL;
        BOOL bResult;
        DWORD dwSignerInfo;
        PCMSG_SIGNER_INFO pSignerInfo = NULL;
        CERT_INFO CertInfo;
        PCCERT_CONTEXT pCertContext = NULL;
        LPWSTR lpwstrSubjectName = NULL;
        LPSTR lpstrSubjectName = NULL;
        LPWSTR lpwstrFileName = NULL;
        LPSTR lpstrFileName = NULL;

        /** create key for return object */
        v8::Local<v8::String> kVerify = v8::String::NewFromUtf8(isolate, "verified").ToLocalChecked();
        v8::Local<v8::String> kSigner = v8::String::NewFromUtf8(isolate, "signer").ToLocalChecked();

        /** set default return object */
        sign->Set(context, kVerify, v8::Boolean::New(isolate, false)).Check();
        sign->Set(context, kSigner, v8::String::NewFromUtf8(isolate, "(unknown signer)").ToLocalChecked()).Check();

        lpstrFileName = *fileName;

        /** Convert filename to LPWSTR */
        dwData = MultiByteToWideChar(CP_UTF8, NULL, lpstrFileName, fileName.length(), NULL, 0);
        lpwstrFileName = (LPWSTR)LocalAlloc(LPTR, dwData * sizeof(WCHAR));
        MultiByteToWideChar(CP_UTF8, NULL, lpstrFileName, fileName.length(), lpwstrFileName, dwData);

        /** Query object  */
        bResult = CryptQueryObject(CERT_QUERY_OBJECT_FILE, lpwstrFileName, CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED_EMBED, CERT_QUERY_FORMAT_FLAG_BINARY, 0, &dwEncoding, &dwContentType, &dwFormatType, &hStore, &hMsg, NULL);
        if (!bResult) {
            goto clean;
        }

        sign->Set(context, kVerify, v8::Boolean::New(isolate, true)).Check();

        /** Get signer info size */
        bResult = CryptMsgGetParam(hMsg, CMSG_SIGNER_INFO_PARAM, 0, NULL, &dwSignerInfo);
        if (!bResult) {
            goto clean;
        }

        pSignerInfo = (PCMSG_SIGNER_INFO)LocalAlloc(LPTR, dwSignerInfo);
        if (!pSignerInfo) {
            goto clean;
        }

        /** Get sign info */
        bResult = CryptMsgGetParam(hMsg, CMSG_SIGNER_INFO_PARAM, 0, (PVOID)pSignerInfo, &dwSignerInfo);
        if (!bResult) {
            goto clean;
        }

        CertInfo.Issuer = pSignerInfo->Issuer;
        CertInfo.SerialNumber = pSignerInfo->SerialNumber;

        /** Get certificate */
        pCertContext = CertFindCertificateInStore(hStore, ENCODING, 0, CERT_FIND_SUBJECT_CERT, (PVOID)&CertInfo, NULL);

        /** Get subject size */
        dwData = CertGetNameStringW(pCertContext, CERT_NAME_SIMPLE_DISPLAY_TYPE, 0, NULL, NULL, 0);
        if (!dwData) {
            goto clean;
        }

        /** Alloc subject name buffer */
        lpwstrSubjectName = (LPWSTR)LocalAlloc(LPTR, dwData * sizeof(WCHAR));
        ZeroMemory(lpwstrSubjectName, dwData * sizeof(WCHAR));

        /** Get subject */
        dwData = CertGetNameStringW(pCertContext, CERT_NAME_SIMPLE_DISPLAY_TYPE, 0, NULL, lpwstrSubjectName, dwData);
        if (!dwData) {
            goto clean;
        }

        /** Convert to utf-8 */
        dwData = WideCharToMultiByte(CP_UTF8, NULL, lpwstrSubjectName, wcslen(lpwstrSubjectName), NULL, 0, NULL, NULL) + 1;
        lpstrSubjectName = (LPSTR)LocalAlloc(LPTR, dwData * sizeof(CHAR));
        dwData = WideCharToMultiByte(CP_UTF8, NULL, lpwstrSubjectName, wcslen(lpwstrSubjectName), lpstrSubjectName, dwData, NULL, NULL);

        sign->Set(context, kSigner, v8::String::NewFromUtf8(isolate, lpstrSubjectName).ToLocalChecked()).Check();

    clean:
        if (lpwstrSubjectName != NULL) LocalFree(lpwstrSubjectName);
        if (lpstrSubjectName != NULL) LocalFree(lpstrSubjectName);
        if (lpwstrFileName != NULL) LocalFree(lpwstrFileName);
        if (pSignerInfo != NULL) LocalFree(pSignerInfo);

        args.GetReturnValue().Set(sign);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "verify", Verify);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}