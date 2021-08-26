# FIDO2 CLIENT - NODE.JS

- FIDO2 is comprised of the W3C's Web Authentication specification (WebAuthn) and FIDO Alliance's corresponding Client-to-Authenticator Protocol (CTAP). FIDO2 supports passwordless, second-factor, and multi-factor user experiences with embedded (or bound) authenticators (such as biometric or PIN) or external/roaming authenticators (such as FIDO Security keys, mobile devices, wearables, etc...).
- Currently, PIN protocols are only supported on Windows and Chrome on macOS. Therefore, we have created a PIN protocol support library that uses Node.js to communicate directly with the security key.
- With this library, we have made it possible for users to use OpenVPN with a security key.

## Summary ##

The FIDO2 client library lets you access FIDO2 devices over BLE, USB, and NFC transports.

## Implementation ##

- USB transport
- BLE transport
- NFC transport
- Client PIN
- Default modal

## Installation

### npm

```sh
npm install @vincss-public-projects/fido2-client
```

For more installation details, see [installation](docs/installation.md).

## Documents

[Docs](docs/README.md)

## License

[MIT](LICENSE)

## End of support v1.x.x