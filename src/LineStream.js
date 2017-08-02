const {Transform} = require("stream");

class LineStream extends Transform {
  constructor(options = {}) {
    super(options);

    this.skipFirstLine = new Boolean(options.skipFirstLine);
    this.encoding = options.encoding || "utf8";
    this.separator = options.separator || "\r\n";

    this.lineCounter = 0;
    this.partialLine = "";
  }

  _transform(chunk, encoding, callback) {
    let linesString = chunk.toString(this.encoding);
    let lines = linesString.split(this.separator);
    let i = 0;
    for (; i < lines.length - 1; i++) {
      let line;
      this.lineCounter++;

      if (this.skipFirstLine && this.lineCounter === 1) {
        continue;
      }

      if (this.partialLine && i === 0) {
        line = this.partialLine + lines[i];
        this.partialLine = "";
      } else {
        line = lines[i];
      }

      if (line.length > 0) {
        this.push(line);
      }
    }

    if (i > 0) {
      let lastLine = lines[i];
      if (lastLine) {
        if (!linesString.endsWith(this.separator)) {
          this.partialLine = lastLine;
        } else {
          this.push(lastLine)
        }
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.partialLine) {
      this.push(this.partialLine);
      this.partialLine = "";
    }
    callback();
  }
}

module.exports = LineStream;
