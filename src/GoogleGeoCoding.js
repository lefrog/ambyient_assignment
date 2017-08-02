const {Transform} = require("stream");
const http_mod = require("http");
const https_mod = require("https");
const {URL} = require("url");

class GoogleGeoCoding extends Transform {
  constructor(options = {}) {
    super({
      writableObjectMode: true
    });

    this.googleGeoCodingUrl = options.googleGeoCodingUrl;
    this.key = options.key;
  }

  _transform(address, encoding, callback) {
    let jsonResponse = "";
    let url = new URL(this._getUrl(address));
    let get = url.protocol === "https:" ? https_mod.get : http_mod.get;

    try {
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
          callback(null, jsonResponse);
        });
        res.on("error", err => {
          callback(err);
        });
      }).on("error", err => {
        callback(err);
      });
    } catch (err) {
      callback(err);
    }
  }

  _getUrl(address) {
    return this.googleGeoCodingUrl
      .replace("{key}", this.key)
      .replace("{address}", address);
  }
}

module.exports = GoogleGeoCoding;
