const fs_mod = require("fs");

const fs_async = require("./fs_async_await");

const appConfig = require("../config.json");

const LineStream = require("./LineStream");
const Throttle = require("./ThrottleReadableStream");
const GoogleGeoCoding = require("./GoogleGeoCoding");

const csvFile = process.argv[2];

async function main(filePath) {
  let fileExist = await fs_async.fileExist(filePath);
  if (!fileExist) {
    console.error(`File doesn't exist: ${filePath}`);
    return 1;
  }

  let lineStream = new LineStream({
    skipFirstLine: appConfig.skip_headers
  });

  let throttle = new Throttle({
    itemPerSecond: appConfig.itemPerSecond
  });

  let googleGeoCoding = new GoogleGeoCoding({
    googleGeoCodingUrl: appConfig.google_map_api.url,
    key: appConfig.google_map_api.key
  });

  fs_mod.createReadStream(filePath, "utf8")
    .pipe(lineStream)
    .pipe(throttle)
    .pipe(googleGeoCoding)
    .pipe(process.stdout)
  ;
}

main(csvFile);
