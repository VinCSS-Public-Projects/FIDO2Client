#include <IOKit/IOKitLib.h>
#include <IOKit/hid/IOHIDKeys.h>
#include <IOKit/hid/IOHIDManager.h>
#include <iconv.h>
#include <node.h>

#define BUFF_LEN 512

namespace Usb {

    bool GetStringProperty(IOHIDDeviceRef device, CFStringRef property, char* buff, size_t szBuff) {
        CFStringRef value;

        value = (CFStringRef)IOHIDDeviceGetProperty(device, property);
        memset(buff, 0, szBuff);
        if (value == NULL) {
            return false;
        }

        CFIndex szValue = CFStringGetLength(value);
        CFRange range;
        CFIndex usedBuffLen;
        CFIndex copied;

        szBuff--;
        range.location = 0;
        range.length = ((size_t)szValue > szBuff) ? szBuff : (size_t)szValue;
        copied = CFStringGetBytes(value, range, kCFStringEncodingMacRoman, (char)'?', FALSE, (UInt8*)buff, szBuff * sizeof(wchar_t), &usedBuffLen);

        buff[(size_t)copied == szBuff ? szBuff : copied] = 0;

        return true;
    }

    void Device(const v8::FunctionCallbackInfo<v8::Value>& args) {
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

        v8::Local<v8::Object> device = v8::Object::New(isolate);
        v8::String::Utf8Value fileName(isolate, args[0]->ToString(context).ToLocalChecked());
        io_registry_entry_t entry = MACH_PORT_NULL;
        IOHIDDeviceRef deviceRef = NULL;
        iconv_t cd;
        char lpBuff[BUFF_LEN * 4];
        wchar_t lpwBuff[BUFF_LEN];
        char* iconv_in, * iconv_out;
        size_t iconv_in_bytes, iconv_out_bytes;


        entry = IORegistryEntryFromPath(kIOMasterPortDefault, *fileName);
        if (entry == MACH_PORT_NULL) {
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "can not open device.").ToLocalChecked()));
            goto clean;
        }

        deviceRef = IOHIDDeviceCreate(kCFAllocatorDefault, entry);
        if (deviceRef == NULL) {
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "can not open device.").ToLocalChecked()));
            goto clean;
        }

        setlocale(LC_CTYPE, "C");
        cd = iconv_open("UTF-8", "UTF-32LE");
        if (cd == (iconv_t)-1) {
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "can not open charset converter.").ToLocalChecked()));
            goto clean;
        }

        if (GetStringProperty(deviceRef, CFSTR(kIOHIDManufacturerKey), lpBuff, sizeof(lpBuff))) {
            memset(lpwBuff, 0, BUFF_LEN * sizeof(wchar_t));
            mbstowcs(lpwBuff, (char*)&lpBuff[0], BUFF_LEN);
            memset(lpBuff, 0, sizeof(lpBuff));

            iconv_in = (char*)&lpwBuff[0];
            iconv_out = (char*)&lpBuff[0];
            iconv_in_bytes = wcslen(lpwBuff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(lpBuff);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kManufacturer = v8::String::NewFromUtf8(isolate, "manufacturer").ToLocalChecked();
                v8::Local<v8::String> vManufacturer = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
                device->Set(context, kManufacturer, vManufacturer).Check();
            }
        }

        if (GetStringProperty(deviceRef, CFSTR(kIOHIDProductKey), lpBuff, sizeof(lpBuff))) {
            memset(lpwBuff, 0, BUFF_LEN * sizeof(wchar_t));
            mbstowcs(lpwBuff, (char*)&lpBuff[0], BUFF_LEN);
            memset(lpBuff, 0, sizeof(lpBuff));

            iconv_in = (char*)&lpwBuff[0];
            iconv_out = (char*)&lpBuff[0];
            iconv_in_bytes = wcslen(lpwBuff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(lpBuff);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kProduct = v8::String::NewFromUtf8(isolate, "product").ToLocalChecked();
                v8::Local<v8::String> vProduct = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
                printf("%s\n", lpBuff);
                device->Set(context, kProduct, vProduct).Check();
            }
        }

        if (GetStringProperty(deviceRef, CFSTR(kIOHIDSerialNumberKey), lpBuff, sizeof(lpBuff))) {
            memset(lpwBuff, 0, BUFF_LEN * sizeof(wchar_t));
            mbstowcs(lpwBuff, (char*)&lpBuff[0], BUFF_LEN);
            memset(lpBuff, 0, sizeof(lpBuff));

            iconv_in = (char*)&lpwBuff[0];
            iconv_out = (char*)&lpBuff[0];
            iconv_in_bytes = wcslen(lpwBuff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(lpBuff);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kSerial = v8::String::NewFromUtf8(isolate, "serial").ToLocalChecked();
                v8::Local<v8::String> vSerial = v8::String::NewFromUtf8(isolate, lpBuff).ToLocalChecked();
                device->Set(context, kSerial, vSerial).Check();
            }
        }

        args.GetReturnValue().Set(device);

    clean:
        if (deviceRef != NULL) CFRelease(deviceRef);
        if (entry != MACH_PORT_NULL) IOObjectRelease(entry);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "device", Device);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}