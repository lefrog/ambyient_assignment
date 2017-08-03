const logger = require("log4js").getLogger("GoogleGeoCodingStream");
const {Transform} = require("stream");
const http_mod = require("http");
const https_mod = require("https");
const {URL} = require("url");

class GoogleGeoCodingStream extends Transform {
  constructor(options = {}) {
    super({
      objectMode: true
    });

    this.googleGeoCodingUrl = options.googleGeoCodingUrl;
    this.key = options.key;
    this.maxAttempt = 10;
  }

  _transform(buffer, encoding, callback) {
    let address = buffer.toString();
    let url = new URL(this._getUrl(address));
    let get = url.protocol === "https:" ? https_mod.get : http_mod.get;
    this._execRequest(get, url, address, callback)
  }

  _execRequest(get, url, address, callback, attempt = 0) {
    let jsonResponse = "";
    let request = get(url, res => {
      const {
        statusCode,
        statusMessage
      } = res;

      if (statusCode !== 200) {
        callback(new Error(statusMessage));
        return;
      }

      res.setEncoding("utf8");
      res.on("data", chunk => {
        jsonResponse += chunk;
      });
      res.on("end", () => {
        let geoCodeResponse = JSON.parse(jsonResponse);
        callback(null, {
          address,
          geoCodeResponse
        });
      });
      res.on("error", err => {
        callback(err);
      });
    }).on("error", err => {
      if (err.code === "ECONNREFUSED") {
        if (attempt > this.maxAttempt) {
          logger.error(`connection refused. exhausted max attempts`);
          callback(err);
        } else {
          attempt++;
          let delay = attempt * attempt * 1000;
          logger.warn(`connection refused. attempt ${attempt}, will try again in ${delay}ms`);
          setTimeout(() => this._execRequest(get, url, callback, attempt), delay);
        }
      } else {
        callback(err);
      }
    });
  }

  _getUrl(address) {
    return this.googleGeoCodingUrl
      .replace("{key}", this.key)
      .replace("{address}", address);
  }
}

module.exports = GoogleGeoCodingStream;
