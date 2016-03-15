var instructions = require("../scripts/instruction-lookup.js"),
  expect = require("chai").expect;

describe('Dictionary', function() {

  var err;
  before(function(done) {
    instructions.load(false, function(e) {
      err = e;
      done();
    });
  });

  it("loads", function() {
    expect(err).to.equal(null);
  });

  it("contains instructions", function() {
    expect(instructions.find('take one a day')).to.equal(1);
    expect(instructions.find('take two in the morning')).to.equal(2);
    expect(instructions.find('take 2 twice a day')).to.equal(4);
  });
});
