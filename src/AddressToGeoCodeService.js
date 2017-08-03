const logger = require("log4js").getLogger("AddressToGeoCodeService");
const EventEmitter = require('events');

const LineStream = require("./LineStream");
const ThrottleStream = require("./ThrottleStream");
const GoogleGeoCodingStream = require("./GoogleGeoCodingStream");
const FilterGeoCodeResponseStream = require("./FilterGeoCodeResponseStream");

class AddressToGeoCodeService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.skipHeaders = options.skipHeaders === undefined ? true : Boolean(options.skipHeaders);
    this.itemPerSecond = options.itemPerSecond || 50;
    this.googleGeoCodingUrl = options.googleGeoCodingUrl;
    this.apiKey = options.apiKey;
  }

  processFile(inStream, outStream) {
    let lineStream = new LineStream({
      skipFirstLine: this.skipHeaders
    });

    let throttleStream = new ThrottleStream({
      itemPerSecond: this.itemPerSecond
    });

    let googleGeoCodingStream = new GoogleGeoCodingStream({
      googleGeoCodingUrl: this.googleGeoCodingUrl,
      key: this.apiKey
    });

    let filterGeoCodeResponseStream = new FilterGeoCodeResponseStream();
    filterGeoCodeResponseStream.on(FilterGeoCodeResponseStream.events.NOT_OK, response => {
      this.emit(AddressToGeoCodeService.events.RESPONSE_NOT_OK, response);
    });

    inStream
      .pipe(lineStream)
      .pipe(throttleStream)
      .pipe(googleGeoCodingStream)
      .pipe(filterGeoCodeResponseStream)
      .pipe(outStream)
    ;
  }
}

AddressToGeoCodeService.events = {
  RESPONSE_NOT_OK: "RESPONSE_NOT_OK"
};

module.exports = AddressToGeoCodeService;
