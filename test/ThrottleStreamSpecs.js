const should = require("chai").should();
const Timer = require("minimal-timer");

const ThrottleStream = require("../src/ThrottleStream");

describe("ThrottleStream", function () {
  context("when throttling at 1 item/second", function () {
    it("should emit 2 items in 2 secs", function (done) {
      this.timeout(5000);

      const stopwatch = Timer();

      let result = [];
      const sut = new ThrottleStream({
        itemPerSecond: 1
      });
      sut.on("data", buffer => {
        result.push(buffer.toString());
      });

      stopwatch.start();
      sut.write("a");
      sut.write("b");
      sut.write("c");
      sut.end(() => {
        stopwatch.stop();
        stopwatch.elapsedTime().should.be.above(2000).and.below(3000);
        result.should.eql(["a", "b", "c"]);
        done();
      });
    });
  });
});