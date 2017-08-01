const fs_mod = require("fs");

function fileExist(filepath) {
  return new Promise((resolve, reject) => {
    fs_mod.access(filepath, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
}

module.exports = {
  fileExist
};
