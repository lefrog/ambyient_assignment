const {Transform} = require("stream");
const os_mod = require("os");

class ObjectToJsonStream extends Transform {
  constructor(options = {}) {
    super({
      objectMode: true
    });
  }

  _transform(object, encoding, callback) {
    callback(null, JSON.stringify(object) + os_mod.EOL);
  }
}

module.exports = ObjectToJsonStream;
