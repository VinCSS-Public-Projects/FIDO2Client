{
    'targets': [
        {
            'target_name': 'sign',
            'conditions': [
                [
                    'OS=="win"',
                    {
                        'sources': [
                            'src/sign/signtool.cc'
                        ]
                    }
                ],
                [
                    'OS=="linux"',
                    {
                        'sources': [
                            'src/sign/linux.cc'
                        ]
                    }
                ],
                [
                    'OS=="mac"',
                    {
                        'sources': [
                            'src/sign/codesign.cc'
                        ],
                        'LDFLAGS': [
                            '-framework CoreFoundation',
                            '-framework AppKit'
                        ],
                        'xcode_settings': {
                            'OTHER_LDFLAGS': [
                                '-framework CoreFoundation',
                                '-framework AppKit'
                            ],
                        }
                    }
                ]
            ]
        },
        {
            'target_name': 'usb',
            'conditions': [
                [
                    'OS=="win"',
                    {
                        'sources': [
                            'src/transports/usb/native/win.cc'
                        ]
                    }
                ],
                [
                    'OS=="linux"',
                    {
                        'sources': [
                            'src/transports/usb/native/linux.cc'
                        ]
                    }
                ],
                [
                    'OS=="mac"',
                    {
                        'sources': [
                            'src/transports/usb/native/mac.cc'
                        ],
                        'LDFLAGS': [
                            '-framework IOKit',
                            '-framework CoreFoundation',
                            '-framework AppKit'
                        ],
                        'xcode_settings': {
                            'OTHER_LDFLAGS': [
                                '-framework IOKit',
                                '-framework CoreFoundation',
                                '-framework AppKit'
                            ],
                        }
                    }
                ]
            ]
        }
    ]
}