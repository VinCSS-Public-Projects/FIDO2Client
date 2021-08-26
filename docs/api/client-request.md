# IClientRequest
> Contain information about the source of the request to the client. Let the user decide to accept or deny the request.

* `process`: `string` The process name that running the client.
* `publisher`: `string` The publisher of process that running the client. Only available on Windows and OS X.
* `trusted`: `boolean` Set to `true` if the `publisher` is trusted.
* `rp`: `string` Relying party that sends the request to the client.