/* jshint node: true */
"use strict";

var dictionary = require('./scripts/code-lookup.js'),
  instructions = require('./scripts/instruction-lookup.js'),
  pkg = require('./package.json'),
  program = require('commander');

program
  .version(pkg.version)
  .option('-c, --process-codes <file>', 'Takes <file> with a list of codes, and outputs a file with code, drug family, drug type and dose(mg)')
  .option('-i, --process-instructions <file>', 'Takes <file> with a list of drug instructions (e.g. "take one a day"), and outputs a file with instruction and tablets per day')
  .option('-a, --process-all <file>', 'Takes <file> with a list of drug information and outputs the data necessary for the algorithm')
  .parse(process.argv);

var doneFn = function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
};

if (program.processCodes) {
  dictionary.process(program.processCodes, doneFn);
} else if (program.processInstructions) {
  instructions.process(program.processInstructions, doneFn);
} else if (program.processAll) {

} else {
  console.error('no command given!');
  program.help();
}
