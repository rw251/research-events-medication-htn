/* jshint node: true */
"use strict";

var dictionary = require('./scripts/code-lookup.js');

dictionary.loadCodes(function(err){
  if(err) {
    console.log(err);
    process.exit(1);
  }

  console.log(dictionary.find('bd11.'));
  console.log(dictionary.find('AMTA23851NEMIS'));
  process.exit(0);
});
