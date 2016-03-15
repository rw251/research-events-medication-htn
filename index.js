/* jshint node: true */
"use strict";

var dictionary = require('./scripts/code-lookup.js'),
  instructions = require('./scripts/instruction-lookup.js');

dictionary.loadCodes(true, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log(dictionary.find('bd11.'));
  console.log(dictionary.find('AMTA23851NEMIS'));

  dictionary.processCodeList("resources/example-codes.txt", function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    instructions.load(true, function(err) {
      if (err) {
        console.log(err);
        process.exit(1);
      }

      console.log(instructions.find('one a day'));
      console.log(instructions.find('2, twice a day'));

      instructions.process("resources/example-instructions.txt", function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        process.exit(0);
      });
    });
  });
});
