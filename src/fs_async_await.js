const util_mod = require("util");
const fs_mod = require("fs");


async function fileExist(filePath) {
  try {
    let fAccess = util_mod.promisify(fs_mod.access);
    await fAccess(filePath);
    return true;
  } catch(err) {
    return false;
  }
}

module.exports = {
  fileExist
};
