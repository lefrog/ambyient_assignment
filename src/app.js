const appConfig = require("../config.json");
const fs_async = require("./fs_async_await");

const fs_mod = require("fs");
const Throttle = require("./ThrottleReadableStream");

const csvFile = process.argv[2];

async function main(filePath) {
  let fileExist = await fs_async.fileExist(filePath);
  if (!fileExist) {
    console.error(`File doesn't exist: ${filePath}`);
    return 1;
  }

  let throttle = new Throttle();
  throttle.on("data", data => {
    console.log(`data: ${data}`);
  });

  const byline = require("byline");
  fs_mod.createReadStream(filePath, "utf8")
    .pipe(byline.createStream())
    .pipe(throttle);
}

main(csvFile);
