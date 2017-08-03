const logger = require("log4js").getLogger("FilterGeoCodeResponseStream");
const {Transform} = require("stream");

class FilterGeoCodeResponseStream extends Transform {
  constructor(options = {}) {
    super({
      objectMode: true
    });
  }

  _transform(data, encoding, callback) {
    if (data.status !== "OK") {
      logger.trace(`skipping: ${data}`);
      this.emit(FilterGeoCodeResponseStream.events.NOT_OK, data);
      callback(null, null);
      return;
    }

    let roofTop = data.results.find(r => {
      return r.geometry.location_type === "ROOFTOP"
    });

    if (!roofTop) {
      logger.trace(`skipping: ${data}`);
      this.emit(FilterGeoCodeResponseStream.events.NO_ROOFTOP, data);
      callback(null, null);
      return;
    }

    if (logger.isDebugEnabled()) {
      logger.debug(`found: ${JSON.stringify(data)}`);
    }
    callback(null, data);
  }
}

FilterGeoCodeResponseStream.events = {
  NOT_OK: "not_ok",
  NO_ROOFTOP: "no_rooftop"
};

module.exports = FilterGeoCodeResponseStream;
