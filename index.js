/* jshint node: true */
"use strict";

var db = require('./scripts/db.js');

db.loadCodes(function(err){
  if(err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
});
