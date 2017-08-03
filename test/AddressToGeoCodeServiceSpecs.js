const should = require("chai").should();

const {Readable, Transform} = require("stream");
const AddressToGeoCodeService = require("../src/AddressToGeoCodeService");

describe("AddressToGeoCodeService", function () {
  context("integration tests", function () {
    this.timeout(10000);

    context("when querying 2 valid and 1 invalid address", function() {
      it("should return 2 addresses", function (done) {
        let result = [];

        const sut = new AddressToGeoCodeService({
          googleGeoCodingUrl: "https://maps.googleapis.com/maps/api/geocode/json?key={key}&address={address}",
          apiKey: "AIzaSyASiBj4QKpCtiTtY6wtJND0QCf3sBVHL1s"
        });

        let input = new Readable();
        let output = new Transform({
          objectMode: true,

          transform(data, encoding, callback) {
            result.push(data);
            this.push(data);
            callback();
          }
        });
        output.on("finish", () => {
          result.length.should.equal(2);
          done();
        });

        sut.processFile(input, output);

        let inputData = [
          "Address",
          "3895 Church Street, Clarkston, GA 30021, USA",
          "totally invalid address (I hope so...)",
          "1103 Bombay Lane, Roswell, GA 30076, USA"
        ].join("\r\n");
        input.push(inputData);
        input.push(null);
      });
    });
  });
});