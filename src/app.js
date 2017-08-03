const logger = require("log4js").getLogger();
logger.level = process.env.LOG_LEVEL || "INFO";

const fs_mod = require("fs");

const fs_async = require("./fs_async_await");

const appConfig = require("../config.json");

const AddressToGeoCodeService = require("./AddressToGeoCodeService");
const ObjectToJsonStream = require("./ObjectToJsonStream");

const csvFile = process.argv[2];

async function main(filePath) {
  logger.info(`processing file: ${filePath}`);

  let fileExist = await fs_async.fileExist(filePath);
  if (!fileExist) {
    console.error(`File doesn't exist: ${filePath}`);
    return 1;
  }

  let addressToGeoCodeService = new AddressToGeoCodeService({
    skipHeaders: appConfig.skip_headers,
    itemPerSecond: appConfig.itemPerSecond,
    googleGeoCodingUrl: appConfig.google_map_api.url,
    apiKey: appConfig.google_map_api.key
  });
  addressToGeoCodeService.on(AddressToGeoCodeService.events.RESPONSE_NOT_OK, response => {
    logger.isDebugEnabled() && logger.debug(`RESPONSE_NOT_OK: ${JSON.stringify(response)}`);
  });

  let output = new ObjectToJsonStream();
  output.pipe(process.stdout);

  addressToGeoCodeService.processFile(
    fs_mod.createReadStream(filePath, "utf8"),
    output
  );
}

main(csvFile);
