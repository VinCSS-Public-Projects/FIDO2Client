class NodeHID {
    static IsFIDO2Device = (path) => {
        if (process.platform === 'linux') {
            let info = require('../../../build/Release/hid_linux').getReportDescriptor(path);
            return info.usagePage === 0xF1D0 && info.usage & 1;
        }
        // TODO other platform

        return false;
    }
}

module.exports.NodeHID = NodeHID;