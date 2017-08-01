const appConfig = require("../config.json");
const fs_async = require("./fs_async_await");

const csvFile = process.argv[2];

async function main(aCsvFile) {
  try {
    console.log(`csvFile: ${csvFile}`);
    let exist = await fs_async.fileExist(aCsvFile);
    console.log(exist);
  } catch (err) {
    console.error(`process failed: ${err}`);
  }
}

main(csvFile);
