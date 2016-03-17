/* jshint node: true */
"use strict";

var parse = require('csv-parse'),
  path = require('path'),
  fs = require('fs'),
  //stream = require('stream'),
  es = require("event-stream"),
  transform = require('stream-transform');

var dictionary = {};

var find = function(code) {
  if (dictionary[code]) return dictionary[code];
  return [];
};

var processFile = function(file, callback) {
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
      var rtn = find(data[0]).map(function(v) {
        return [data[0], v.family, v.type, v.dose].join("\t") + "\n";
      });
      rtn.unshift(null);
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
};

var load = function(log, callback) {
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
                dictionary[els[0]] = [item];
              }
            } else if (els.length > 1) {
              if (log) console.log("Line doesn't have 5 elements: " + line);
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
          itemsProcessed++;
          if (itemsProcessed === files.length) {
            callback(null);
          }
        })
      );
  });
};

module.exports = {

  /*
   * Lookup codes in the dictionary
   */
  find: find,

  /*
   * Populate the dictionary from code lists in files
   */
  load: load,

  /*
   * Convert a file containing a list of codes, into one with
   * the associated family, type and dose
   */
  processFile: processFile,

  /*
   * Process a file - loads dictionary if not exists
   */
  process: function(file, callback) {
    if (Object.keys(dictionary).length === 0) {
      load(false, function(){
        processFile(file, callback);
      });
    } else {
      processFile(file, callback);
    }
  }
};
