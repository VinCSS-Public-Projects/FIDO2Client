#include "common.h"
#include "device.h"

namespace pcsc {

    Device::Device(char* name, int nonce) {
#ifdef _WIN32
        this->name = _strdup((const char*)name);
#else
        this->name = strdup(name);
#endif // _WIN32
        this->nonce = nonce;
    }

    Device::~Device() {
        free(this->name);
    }

    bool Device::Validate(int nonce) {
        return this->nonce == nonce;
    }
}