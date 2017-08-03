const logger = require("log4js").getLogger("FilterGeoCodeResponseStream");
const {Transform} = require("stream");

class FilterGeoCodeResponseStream extends Transform {
  constructor(options = {}) {
    super({
      objectMode: true
    });
  }

  _transform(data, encoding, callback) {
    let {
      address,
      geoCodeResponse
    } = data;
    if (geoCodeResponse.status !== "OK") {
      logger.trace(`skipping: ${data}`);
      this.emit(FilterGeoCodeResponseStream.events.NOT_OK, data);
      callback(null, null);
      return;
    }

    let roofTop = geoCodeResponse.results.find(r => {
      return r.geometry.location_type === "ROOFTOP"
    });

    if (!roofTop) {
      logger.trace(`skipping: ${data}`);
      this.emit(FilterGeoCodeResponseStream.events.NO_ROOFTOP, data);
      callback(null, null);
      return;
    }

    logger.isDebugEnabled() && logger.debug(`found: ${JSON.stringify(data)}`);
    callback(null, geoCodeResponse);
  }
}

FilterGeoCodeResponseStream.events = {
  NOT_OK: "NOT_OK",
  NO_ROOFTOP: "NO_ROOFTOP"
};

module.exports = FilterGeoCodeResponseStream;
