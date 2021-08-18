#include <node.h>

#include "common.h"
#include "service.h"
#include "card.h"
#include "pcsc.h"

namespace pcsc {

    void Initialize(v8::Local<v8::Object> exports) {

        /** Init Service wrapper. */
        Service::Init(exports);

        /** Init Card wrapper. */
        Card::Init(exports);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}