#include <node.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <fcntl.h>
#include <libudev.h>
#include <iconv.h>

#define MAX_BUFF 512

#define pManufacturer   "manufacturer"
#define pProduct        "product"
#define pSerial         "serial"

namespace Usb {

    bool GetStringProperty(int handle, const char* property, wchar_t* buff, size_t len) {
        udev* udev = NULL;
        udev_device* udev_dev = NULL;
        udev_device* parent = NULL;
        udev_device* hid_dev = NULL;
        struct stat s;
        const char* value = NULL;
        bool ret = false;

        udev = udev_new();
        if (udev == NULL) {
            return false;
        }

        if (fstat(handle, &s) == -1) {
            goto clean;
        }

        udev_dev = udev_device_new_from_devnum(udev, 'c', s.st_rdev);
        if (udev_dev == NULL) {
            goto clean;
        }

        hid_dev = udev_device_get_parent_with_subsystem_devtype(udev_dev, "hid", NULL);
        if (hid_dev == NULL) {
            goto clean;
        }

        parent = udev_device_get_parent_with_subsystem_devtype(udev_dev, "usb", "usb_device");
        if (parent == NULL) {
            goto clean;
        }

        value = udev_device_get_sysattr_value(parent, property);
        if (value == NULL) {
            goto clean;
        }

        mbstowcs(buff, value, len);
        ret = true;

    clean:
        if (udev_dev != NULL) udev_device_unref(udev_dev);
        if (udev != NULL) udev_unref(udev);

        return ret;
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
        iconv_t cd;
        int handle;
        wchar_t buff[MAX_BUFF];
        char utf8[MAX_BUFF * sizeof(wchar_t)];
        char* iconv_in, * iconv_out;
        size_t iconv_in_bytes, iconv_out_bytes;

        setlocale(LC_CTYPE, "C");

        cd = iconv_open("UTF-8", "UTF-32LE");
        if (cd == (iconv_t)-1) {
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "can not open charset converter.").ToLocalChecked()));
            return;
        }

        handle = open(*fileName, O_RDWR);
        if (handle <= 0) {
            goto clean;
        }

        wmemset(buff, 0, MAX_BUFF);
        if (GetStringProperty(handle, pManufacturer, buff, MAX_BUFF)) {
            memset(utf8, 0, sizeof(utf8));
            iconv_in = (char*)&buff[0];
            iconv_out = (char*)&utf8[0];
            iconv_in_bytes = wcslen(buff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(utf8);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kManufacturer = v8::String::NewFromUtf8(isolate, "manufacturer").ToLocalChecked();
                v8::Local<v8::String> vManufacturer = v8::String::NewFromUtf8(isolate, utf8).ToLocalChecked();
                device->Set(context, kManufacturer, vManufacturer).Check();
            }
        }

        wmemset(buff, 0, MAX_BUFF);
        if (GetStringProperty(handle, pProduct, buff, MAX_BUFF)) {
            memset(utf8, 0, sizeof(utf8));
            iconv_in = (char*)&buff[0];
            iconv_out = (char*)&utf8[0];
            iconv_in_bytes = wcslen(buff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(utf8);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kProduct = v8::String::NewFromUtf8(isolate, "product").ToLocalChecked();
                v8::Local<v8::String> vProduct = v8::String::NewFromUtf8(isolate, utf8).ToLocalChecked();
                device->Set(context, kProduct, vProduct).Check();
            }
        }

        wmemset(buff, 0, MAX_BUFF);
        if (GetStringProperty(handle, pSerial, buff, MAX_BUFF)) {
            memset(utf8, 0, sizeof(utf8));
            iconv_in = (char*)&buff[0];
            iconv_out = (char*)&utf8[0];
            iconv_in_bytes = wcslen(buff) * sizeof(wchar_t);
            iconv_out_bytes = sizeof(utf8);

            if (iconv(cd, &iconv_in, &iconv_in_bytes, &iconv_out, &iconv_out_bytes) != (size_t)-1) {
                v8::Local<v8::String> kSerial = v8::String::NewFromUtf8(isolate, "serial").ToLocalChecked();
                v8::Local<v8::String> vSerial = v8::String::NewFromUtf8(isolate, utf8).ToLocalChecked();
                device->Set(context, kSerial, vSerial).Check();
            }
        }

        close(handle);

    clean:
        iconv_close(cd);

        args.GetReturnValue().Set(device);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "device", Device);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}