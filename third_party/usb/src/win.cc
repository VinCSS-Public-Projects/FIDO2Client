#include <node.h>
#include <windows.h>
#include <hidsdi.h>

#pragma comment(lib, "Hid.lib")

#define MAX_BUFF 512

namespace Usb {

    void Device(const v8::FunctionCallbackInfo<v8::Value>& args) {
        HANDLE hDevice = NULL;
        LPSTR lpFileName = NULL;
        BOOLEAN bResult;
        DWORD dwResult;
        LPWSTR lpwBuff = NULL;
        DWORD szlpwBuff;
        LPSTR lpBuff = NULL;

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

        v8::String::Utf8Value fileName(isolate, args[0]->ToString(context).ToLocalChecked());
        lpFileName = *fileName;

        hDevice = CreateFileA(lpFileName, NULL, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, FILE_FLAG_OVERLAPPED, NULL);
        if (hDevice == INVALID_HANDLE_VALUE) {
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "can not open device.").ToLocalChecked()));
            return;
        }

        v8::Local<v8::Object> device = v8::Object::New(isolate);
        szlpwBuff = MAX_BUFF * sizeof(WCHAR);
        lpwBuff = (LPWSTR)LocalAlloc(LPTR, szlpwBuff);

        ZeroMemory(lpwBuff, szlpwBuff);
        bResult = HidD_GetSerialNumberString(hDevice, lpwBuff, szlpwBuff);
        if (bResult) {
            v8::Local<v8::String> kSerial = v8::String::NewFromUtf8(isolate, "serial").ToLocalChecked();
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), NULL, 0, NULL, NULL) + 1;
            lpBuff = (LPSTR)LocalAlloc(LPTR, dwResult * sizeof(CHAR));
            ZeroMemory(lpBuff, dwResult * sizeof(CHAR));
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), lpBuff, dwResult * sizeof(CHAR), NULL, NULL);
            v8::Local<v8::String> vSerial = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
            device->Set(context, kSerial, vSerial);
            LocalFree(lpBuff);
        }

        ZeroMemory(lpwBuff, szlpwBuff);
        bResult = HidD_GetManufacturerString(hDevice, lpwBuff, szlpwBuff);
        if (bResult) {
            v8::Local<v8::String> kManufacturer = v8::String::NewFromUtf8(isolate, "manufacturer").ToLocalChecked();
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), NULL, 0, NULL, NULL) + 1;
            lpBuff = (LPSTR)LocalAlloc(LPTR, dwResult * sizeof(CHAR));
            ZeroMemory(lpBuff, dwResult * sizeof(CHAR));
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), lpBuff, dwResult * sizeof(CHAR), NULL, NULL);
            v8::Local<v8::String> vManufacturer = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
            device->Set(context, kManufacturer, vManufacturer);
            LocalFree(lpBuff);
        }

        ZeroMemory(lpwBuff, szlpwBuff);
        bResult = HidD_GetProductString(hDevice, lpwBuff, szlpwBuff);
        if (bResult) {
            v8::Local<v8::String> kProduct = v8::String::NewFromUtf8(isolate, "product").ToLocalChecked();
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), NULL, 0, NULL, NULL) + 1;
            lpBuff = (LPSTR)LocalAlloc(LPTR, dwResult * sizeof(CHAR));
            ZeroMemory(lpBuff, dwResult * sizeof(CHAR));
            dwResult = WideCharToMultiByte(CP_UTF8, NULL, lpwBuff, wcslen(lpwBuff), lpBuff, dwResult * sizeof(CHAR), NULL, NULL);
            v8::Local<v8::String> vProduct = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
            device->Set(context, kProduct, vProduct);
            LocalFree(lpBuff);
        }

        if (hDevice != NULL) CloseHandle(hDevice);
        if (lpwBuff != NULL) LocalFree(lpwBuff);

        args.GetReturnValue().Set(device);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "device", Device);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}