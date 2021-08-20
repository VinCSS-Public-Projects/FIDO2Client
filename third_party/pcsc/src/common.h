
#ifndef _common_h_
#define _common_h_

/** Comment below line to disable debug log. */
// #define DEBUG

/** Include standard library headers.*/
#ifdef _WIN32
#include <windows.h>
#define THROW(isolate, ...) {\
    char buff[1024];\
    ZeroMemory(buff, 1024);\
    sprintf_s(buff, 1023, __VA_ARGS__);\
    isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, buff).ToLocalChecked()));\
    return;\
}
#else
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define THROW(isolate, ...) {\
    char buff[1024];\
    memset(buff, 0, 1024);\
    snprintf(buff, 1023, __VA_ARGS__);\
    isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, buff).ToLocalChecked()));\
    return;\
}
#endif

/** Include winscard library headers. */
#ifdef __APPLE__
#include <PCSC/winscard.h>
#include <PCSC/wintypes.h>
#include <PCSC/pcsclite.h>
#else
#include <winscard.h>
#endif // _WIN32

#define SCARD_CHECKRET(isolate, hContext, status, ...) {\
    if (status != SCARD_S_SUCCESS) {\
        if (hContext != 0) {\
            hContext = 0;\
            SCardReleaseContext(hContext);\
        }\
        THROW(isolate, __VA_ARGS__)\
    }\
}

/** Define LOG macros. */
#ifdef DEBUG
#define LOG(...) {\
    printf(__VA_ARGS__);\
}
#else
#define LOG(...)
#endif

/** Define PCSC constants. */
#define MAX_ATR_STRING 32
#define MAX_READER_NAME 1024

#endif // _common_h_