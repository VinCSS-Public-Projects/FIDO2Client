# IFido2DeviceInfo

> Contain info of the selected device.

* `uv`: `boolean | undefined` - This indicates that the authenticator supports a built-in user verification method. For example, devices with LCD, biometrics, ... Possible value are:
  * `undefined` - Indicates that the authenticator does not have a built-in user verification method.
  * `true` - Indicates that the authenticator does not have a built-in user verification method and that user verification method is presently configured, ready for user verification.
  * `false` - Indicates that the authenticator does not have a built-in user verification method and that user verification method is not presently configured, need to be configured before user verification.
* `clientPin`: `boolean | undefined` - Indicates the authenticator accept client PIN request from the client. Possible value are
  * `undefined` - Indicates that the device not capable of client PIN request from the client.
  * `true` - Indicates that the device capable of client PIN request from the client and PIN has been set.
  * `false` - Indicates that the device capable of client PIN request from the client but PIN has not been set yet.
* `uvRetries`: `number` - Number of built-in user verification method attempts remaining before blocked.
* `pinRetries`: `number` - Number of PIN attempts remaining before blocked.