#define DEVICE_LIFETIME 250

namespace pcsc {
    class Device {
    public:
        Device(char* name, int nonce);
        ~Device();
        bool Validate(int nonce);
        char* name;
        int nonce;
    };
}