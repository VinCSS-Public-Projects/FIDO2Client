#include <node.h>
#include <node_object_wrap.h>

#include "device.h"

namespace pcsc {

    class Service : public node::ObjectWrap {
    public:
        Service();
        ~Service();
        static void Init(v8::Local<v8::Object> exports);
        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void On(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Update(const v8::FunctionCallbackInfo<v8::Value>& args);
        std::vector<v8::Persistent<v8::Function, v8::CopyablePersistentTraits<v8::Function>>> cardListeners;
        std::vector<v8::Persistent<v8::Function, v8::CopyablePersistentTraits<v8::Function>>> errorListeners;
        std::vector<Device*> devcies;
    };
}