# IFido2Device

> Contain details about a FIDO2 device. Possible properties are:

* `transport`: `string` The transport, possible value are `usb`, `ble` and `nfc`.
* `path`: `string` The path of the device, only available on `usb` transport.
* `uuid`: `string` The uuid of the device, only available on `ble` transport.
* `name`: `string` The name of NFC reader that FIDO2 applet  
  present, only available on `nfc` transport.
* `manufacturer`: `string` The manufacturer of the device, only available on `ble` and `usb` transports.
* `serialNumber`: `string` The serial of the device, only available on `usb` transport.
* `product`: `string` The product name of the device, only available on `usb` transport.
* `batteryLevel`: `string` The current battery level of the device, only available on `ble` transport.