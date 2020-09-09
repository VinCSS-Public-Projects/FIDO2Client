#include <node.h>

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#include <sys/ioctl.h>
#include <linux/hidraw.h>
#include <fcntl.h>
#include <unistd.h>

namespace hidapi {

    int get_key_len(uint8_t tag, uint8_t *key, size_t *key_len) {
        *key = tag & 0xfc;
        if ((*key & 0xf0) == 0xf0) {
            // printf("%s: *key=0x%02x", __func__, *key);
            return -1;
        }

        *key_len = tag & 0x3;
        if (*key_len == 3) {
            *key_len = 4;
        }

        return 0;
    }

    int get_key_val(const void *body, size_t key_len, uint32_t *val) {
        const uint8_t *ptr = (const uint8_t *)body;

        switch (key_len) {
        case 0:
            *val = 0;
            break;
        case 1:
            *val = ptr[0];
            break;
        case 2:
            *val = (uint32_t)((ptr[1] << 8) | ptr[0]);
            break;
        default:
            // printf("%s: key_len=%zu", __func__, key_len);
            return -1;
        }

        return 0;
    }

    int get_report_descriptor(const char *path, struct hidraw_report_descriptor *hrd) {
        int fd;
        int s = -1;
        int ok = -1;

        if ((fd = open(path, O_RDONLY)) < 0) {
            // printf("%s: open\n", __func__);
            return -1;
        }

        if (ioctl(fd, HIDIOCGRDESCSIZE, &s) < 0 || s < 0 || (unsigned)s > HID_MAX_DESCRIPTOR_SIZE) {
            // printf("%s: ioctl HIDIOCGRDESCSIZE\n", __func__);
            goto fail;
        }

        hrd->size = (unsigned)s;

        if (ioctl(fd, HIDIOCGRDESC, hrd) < 0) {
            // printf("%s: ioctl HIDIOCGRDESC\n", __func__);
            goto fail;
        }

        ok = 0;
    fail:
        if (fd != -1)
            close(fd);

        return ok;
    }

    int get_usage_info(const struct hidraw_report_descriptor *hrd, uint32_t *usage_page, uint32_t *usage) {
        const uint8_t *ptr = hrd->value;
        size_t len = hrd->size;
        uint8_t  key, tag;
        size_t   key_len;
        uint32_t key_val;

        while (len > 0) {

            tag = ptr[0];
            ptr++;
            len--;

            if (get_key_len(tag, &key, &key_len) < 0 || key_len > len || get_key_val(ptr, key_len, &key_val) < 0) {
                return -1;
            }

            if (key == 0x4) {
                *usage_page = key_val;
            } else if (key == 0x8) {
                *usage = key_val;
            }

            ptr += key_len;
            len -= key_len;
        }

        return 0;
    }

    void GetUsageInfo(const v8::FunctionCallbackInfo<v8::Value>& args) {
        
        v8::Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        struct hidraw_report_descriptor hrd;
        uint32_t usage = 0;
	    uint32_t usagePage = 0;

        
        if (args.Length() < 1) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Can't open device with `null` path", v8::NewStringType::kNormal).ToLocalChecked()));
            return;
        }
        if (!args[0]->IsString()) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Invalid device path", v8::NewStringType::kNormal).ToLocalChecked()));
            return;
        }

        v8::String::Utf8Value path(isolate, args[0]->ToString(context).ToLocalChecked());

        if (get_report_descriptor(*path, &hrd)) {
            // isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Can't get report descriptor of device", v8::NewStringType::kNormal).ToLocalChecked()));
            // return;
        }

        if (get_usage_info(&hrd, &usagePage, &usage)) {
            // isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Can't get usage info of device", v8::NewStringType::kNormal).ToLocalChecked()));
            // return;
        }

        v8::Local<v8::Object> ret = v8::Object::New(isolate);

        v8::Local<v8::String> kUsagePage = v8::String::NewFromOneByte(isolate, (const uint8_t*)"usagePage", v8::NewStringType::kNormal).ToLocalChecked();
        v8::Local<v8::Number> vUsagePage = v8::Number::New(isolate, usagePage);
        if (!ret->Set( context, kUsagePage, vUsagePage).ToChecked()) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Can't set property `usagePage`", v8::NewStringType::kNormal).ToLocalChecked()));
            return;
        }

        v8::Local<v8::String> kUsage = v8::String::NewFromOneByte(isolate, (const uint8_t*)"usage", v8::NewStringType::kNormal).ToLocalChecked();
        v8::Local<v8::Number> vUsage = v8::Number::New(isolate, usage);
        if (!ret->Set( context, kUsage, vUsage).ToChecked()) {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromOneByte(isolate, (const uint8_t*)"Can't set property `usage`", v8::NewStringType::kNormal).ToLocalChecked()));
            return;
        }

        args.GetReturnValue().Set(ret);
    }

    void Initialize(v8::Local<v8::Object> exports) {
        NODE_SET_METHOD(exports, "getReportDescriptor", GetUsageInfo);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}