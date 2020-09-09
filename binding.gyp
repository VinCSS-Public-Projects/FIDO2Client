{
    "targets": [
        {
            "target_name": "hid_linux",
            "conditions": [
                [
                    'OS=="linux"', {
                        "sources": [
                            "src/Transports/HID/hid_linux.cc"
                        ]
                    }
                ]
            ]
        }
    ]
}
