#define DEVICE_LIFETIME 250

namespace pcsc {
    class Device {
    public:
        Device(char* name);
        ~Device();
        void Update();
        bool Validate();
        char* name;
        unsigned long long timestamp;
    };
}