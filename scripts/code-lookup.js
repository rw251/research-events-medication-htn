/* jshint node: true */
"use strict";

var path = require('path'),
  fs = require('fs'),
  stream = require('stream'),
  es = require("event-stream");

var dictionary = {};

module.exports = {

  find: function(code) {
    if(dictionary[code]) return dictionary[code];
    return [];
  },

  loadCodes: function(callback) {
    var start, s, els, files = fs.readdirSync('resources');

    var itemsProcessed = 0;
    files.forEach(function(file) {
      if (file.indexOf("drug-codes") < 0) {
        itemsProcessed++;
        return;
      }

      s = fs.createReadStream(path.join('resources', file), {
          start: 39
        }) //skips header assuming it is "CODE	FAMILY	TYPE	DOSE(mg)	DESCRIPTION"
        .pipe(es.split())
        .pipe(es.mapSync(function(line) {
            // pause the readstream
            s.pause();
            (function() {
              // process line here and call s.resume() when rdy
              els = line.split('\t');
              if (els.length === 5) {
                var item = {
                  family: els[1],
                  type: els[2],
                  dose: +els[3],
                  description: els[4]
                };
                if (dictionary[els[0]]) {
                  dictionary[els[0]].push(item);
                } else {
                  dictionary[els[0]]=[item];
                }
              } else {
                console.log("Line doesn't have 5 elements: " + line);
              }
              // resume the readstream
              s.resume();
            })();
          })
          .on('error', function(err) {
            console.log('Error while reading file.');
            callback(err);
          })
          .on('end', function() {
            console.log('Read entirefile.');
            itemsProcessed++;
            if(itemsProcessed === files.length) {
              callback(null);
            }
          })
        );
    });
  }
};
