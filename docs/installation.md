
# Installation

## npm

```sh
npm install @vincss-public-projects/fido2-client
```

## Supported Platforms

- Mac OS X
- Windows
- Linux

## Windows

On Windows v1903 and newer versions, direct access to CTAP1/CTAP2 requires admin privilege over all transports, include this library.

For rebuild

* Windows 10 SDK 10.0.17763.0

## Mac OS X

For Bluetooth Low Energy (BLE) transport, you must allow Bluetooth Privacy.

## Linux

For USB Human Interface Device (USB HID) transport, you will need to install development packages for libudev.

```sh
sudo apt-get install libudev-dev libusb-1.0-0-dev libfox-1.6-dev
```

For Near Field Communication (NFC) transport, you would need to install pcsclite library and daemon.

```sh
sudo apt install libpcsclite1 libpcsclite-dev
sudo apt install pcscd
```

For Bluetooth Low Energy (BLE) transport, you would need to install libbluetooth-dev.

```sh
sudo apt-get install libbluetooth-dev
```
