#include <chrono>
#include "common.h"
#include "device.h"

namespace pcsc {

    Device::Device(char* name) {
#ifdef _WIN32
        this->name = _strdup((const char*)name);
#else
        this->name = strdup(name);
#endif // _WIN32
        this->Update();
    }

    Device::~Device() {
        free(this->name);
    }

    void Device::Update() {
        this->timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    }

    bool Device::Validate() {
        unsigned long long now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
        return (now - this->timestamp) > DEVICE_LIFETIME ? false : true;
    }
}