var dictionary = require("../scripts/code-lookup.js"),
  expect = require("chai").expect;

describe('Dictionary', function() {

  var err;
  before(function(done) {
    dictionary.loadCodes(false, function(e) {
      err = e;
      done();
    });
  });

  it("loads", function() {
    expect(err).to.equal(null);
  });

  it("contains codes", function() {
    expect(dictionary.find('bd11.')).to.have.length(1);
    expect(dictionary.find('AMTA23851NEMIS')).to.have.length(2);
    expect(dictionary.find('not a real code')).to.have.length(0);
  });
});
