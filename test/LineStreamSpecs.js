const should = require("chai").should();

const LineStream = require("../src/LineStream");

describe("LineStream", function() {
  context("when parsing a 2 lines string", function() {
    it("should emit 2 lines", function(done) {
      let result = [];
      const sut = new LineStream();
      sut.setEncoding("utf8");
      sut.on("data", data => {
        data.should.be.a("string");
        result.push(data);
      });

      sut.write("foo\r\nbar\r\n");
      sut.end(() => {
        result.should.eql(["foo", "bar"]);
        done();
      });
    });
  });
});