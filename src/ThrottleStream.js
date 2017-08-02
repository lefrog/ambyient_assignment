const {Transform} = require("stream");

const ONE_SECOND = 1000;

class ThrottleStream extends Transform {
  constructor(options = {}) {
    super(options);
    this.itemPerSecond = options.itemPerSecond || 1;

    this._reset();
  }

  _reset() {
    this.itemCounter = 0;
    this.lastRun = Date.now();
  }

  _processData(data, encoding, callback) {
    this.itemCounter++;
    this.push(data);
    callback();
  }

  _transform(data, encoding, callback) {
    if (this.itemCounter >= this.itemPerSecond) {
      let pauseFor = Math.max(
        ONE_SECOND - (Date.now() - this.lastRun),
        0
      );
      this.throttlePauseTimer = setTimeout(
        () => {
          this._reset();
          this._processData(data, encoding, callback);
        },
        pauseFor
      );
    } else {
      this._processData(data, encoding, callback);
    }
  }

  _flush(callback) {
    this.throttlePauseTimer && clearTimeout(this.throttlePauseTimer);
    callback();
  }
}

module.exports = ThrottleStream;
