{
    "targets": [
        {
            "target_name": "usb",
            "conditions": [
                [
                    "OS==\"win\"",
                    {
                        "sources": [
                            "third_party/usb/src/win.cc"
                        ],
                        "libraries": [
                            "-lhid"
                        ]
                    }
                ],
                [
                    "OS==\"linux\"",
                    {
                        "sources": [
                            "third_party/usb/src/linux.cc"
                        ]
                    }
                ],
                [
                    "OS==\"mac\"",
                    {
                        "sources": [
                            "third_party/usb/src/mac.cc"
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
            "target_name": "sign",
            "conditions": [
                [
                    "OS==\"win\"",
                    {
                        "sources": [
                            "third_party/sign/src/win.cc"
                        ],
                        "libraries": [
                            "-lcrypt32"
                        ]
                    }
                ],
                [
                    "OS==\"linux\"",
                    {
                        "sources": [
                            "third_party/sign/src/linux.cc"
                        ]
                    }
                ],
                [
                    "OS==\"mac\"",
                    {
                        "sources": [
                            "third_party/sign/src/mac.cc"
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
            "target_name": "pcsc",
            "sources": [
                "third_party/pcsc/src/pcsc.cc",
                "third_party/pcsc/src/service.cc",
                "third_party/pcsc/src/card.cc",
                "third_party/pcsc/src/device.cc"
            ],
            "include_dirs": [
                "third_party/pcsc/src"
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