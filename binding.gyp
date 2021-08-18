{
    "targets": [
        {
            "target_name": "sign",
            "conditions": [
                [
                    "OS==\"win\"",
                    {
                        "sources": [
                            "src/sign/signtool.cc"
                        ]
                    }
                ],
                [
                    "OS==\"linux\"",
                    {
                        "sources": [
                            "src/sign/linux.cc"
                        ]
                    }
                ],
                [
                    "OS==\"mac\"",
                    {
                        "sources": [
                            "src/sign/codesign.cc"
                        ],
                        "LDFLAGS": [
                            "-framework CoreFoundation",
                            "-framework AppKit"
                        ],
                        "xcode_settings": {
                            "OTHER_LDFLAGS": [
                                "-framework CoreFoundation",
                                "-framework AppKit"
                            ],
                        }
                    }
                ]
            ]
        },
        {
            "target_name": "usb",
            "conditions": [
                [
                    "OS==\"win\"",
                    {
                        "sources": [
                            "src/transports/usb/native/win.cc"
                        ]
                    }
                ],
                [
                    "OS==\"linux\"",
                    {
                        "sources": [
                            "src/transports/usb/native/linux.cc"
                        ]
                    }
                ],
                [
                    "OS==\"mac\"",
                    {
                        "sources": [
                            "src/transports/usb/native/mac.cc"
                        ],
                        "LDFLAGS": [
                            "-framework IOKit",
                            "-framework CoreFoundation",
                            "-framework AppKit"
                        ],
                        "xcode_settings": {
                            "OTHER_LDFLAGS": [
                                "-framework IOKit",
                                "-framework CoreFoundation",
                                "-framework AppKit"
                            ],
                        }
                    }
                ]
            ]
        },
        {
            "target_name": "pcsc",
            "sources": [
                "third_party/src/pcsc.cc",
                "third_party/src/service.cc",
                "third_party/src/card.cc",
                "third_party/src/device.cc"
            ],
            "include_dirs": [
                "third_party/src"
            ],
            "conditions": [
                [
                    "OS==\"win\"",
                    {
                        "libraries": [
                            "-lwinscard"
                        ]
                    }
                ],
                [
                    "OS==\"mac\"",
                    {
                        "LDFLAGS": [
                            "-framework PCSC"
                        ],
                        "xcode_settings": {
                            "OTHER_LDFLAGS": [
                                "-framework PCSC"
                            ]
                        }
                    }
                ],
                [
                    "OS==\"linux\"",
                    {
                        "include_dirs": [
                            "/usr/include/PCSC"
                        ],
                        "cflags": [
                            "-pthread",
                            "-Wno-cast-function-type"
                        ],
                        "libraries": [
                            "-lpcsclite"
                        ]
                    }
                ]
            ]
        }
    ]
}