/* jshint node: true */
"use strict";

var parse = require('csv-parse'),
  path = require('path'),
  fs = require('fs'),
  es = require("event-stream"),
  transform = require('stream-transform');

var regex = [];

var find = function(instruction) {
  var matches = regex.reduce(function(prev, cur) {
    if (instruction.search(cur.regex) > -1) {
      prev.push(cur.tabs);
    }
    return prev;
  }, []);

  if (matches.length > 1) {
    console.warn("WARNING: The instruction - '" + instruction + "' - matches " + matches.length + " of the regular expressions.");
    console.warn("Defaulting to the first match... " + matches[0]);
    return matches[0];
  } else if (matches.length === 0) {
    console.warn("WARNING: The instruction - '" + instruction + "' - matches none of the regular expressions.");
    console.warn("Defaulting to 1 a day...");
    return 1;
  } else {
    return matches[0];
  }
};

module.exports = {

  /*
   * Return number of tablets for an instruction
   */
  find: find,

  /*
   * Populate the regex map from code lists in files
   */
  load: function(log, callback) {
    var start, s, els;

    s = fs.createReadStream(path.join('resources', 'regex.txt'), {
        start: 20
      }) //skips header assuming it is "TABS_PER_DAY  REGEX"
      .pipe(es.split())
      .pipe(es.mapSync(function(line) {
          // pause the readstream
          s.pause();
          (function() {
            // process line here and call s.resume() when rdy
            els = line.split('\t');
            if (els.length === 2) {
              regex.push({
                regex: new RegExp(els[1],"i"),
                tabs: +els[0]
              });
            } else if (line.length > 1) {
              if (log) console.log("Line doesn't have 2 elements: " + line);
            }
            // resume the readstream
            s.resume();
          })();
        })
        .on('error', function(err) {
          if (log) console.log('Error while reading file.');
          callback(err);
        })
        .on('end', function() {
          if (log) console.log('Read entirefile.');
          callback(null);
        })
      );
  },

  /*
   * Convert a file containing a list of instructions, into one with
   * the associated tablets per day
   */
  process: function(file, callback) {
    if (!file) {
      return callback(new Error("No file name specifiec"));
    }

    var parser = parse({
      delimiter: '||||',
      trim: true,
      quote: ""
    });

    var transformer = transform(function(data, callback) {
      setImmediate(function() {
        var rtn = [null, data[0] + '\t' + find(data[0]) + "\n"];
        callback.apply(this, rtn);
      });
    }, {
      parallel: 20
    });

    transformer.on('readable', function(row) {
      while ((row = transformer.read()) !== null) {
        return row;
      }
    });

    transformer.on('error', function(err) {
      console.log(err.message);
    });

    console.time('Elapsed');

    var input = fs.createReadStream(file);
    var output = fs.createWriteStream(file + '.done');
    output.on('finish', function() {
      console.timeEnd('Elapsed');
      callback(null);
    });

    input.pipe(parser).pipe(transformer).pipe(output);
  }
};
