const logger = require("log4js").getLogger();
logger.level = process.env.LOG_LEVEL || "INFO";

const fs_mod = require("fs");

const fs_async = require("./fs_async_await");

const appConfig = require("../config.json");

const LineStream = require("./LineStream");
const ThrottleStream = require("./ThrottleStream");
const GoogleGeoCodingStream = require("./GoogleGeoCodingStream");
const FilterGeoCodeResponseStream = require("./FilterGeoCodeResponseStream");
const ObjectToJsonStream = require("./ObjectToJsonStream");

const csvFile = process.argv[2];

async function main(filePath) {
  logger.info(`processing file: ${filePath}`);

  let fileExist = await fs_async.fileExist(filePath);
  if (!fileExist) {
    console.error(`File doesn't exist: ${filePath}`);
    return 1;
  }

  let lineStream = new LineStream({
    skipFirstLine: appConfig.skip_headers
  });

  let throttleStream = new ThrottleStream({
    itemPerSecond: appConfig.itemPerSecond
  });

  let googleGeoCodingStream = new GoogleGeoCodingStream({
    googleGeoCodingUrl: appConfig.google_map_api.url,
    key: appConfig.google_map_api.key
  });

  fs_mod.createReadStream(filePath, "utf8")
    .pipe(lineStream)
    .pipe(throttleStream)
    .pipe(googleGeoCodingStream)
    .pipe(new FilterGeoCodeResponseStream())
    .pipe(new ObjectToJsonStream())
    .pipe(process.stdout)
  ;
}

main(csvFile);
