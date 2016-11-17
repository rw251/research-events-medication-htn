/* jshint node: true */
"use strict";

var parse = require('csv-parse'),
  path = require('path'),
  fs = require('fs'),
  constants = require('./const.js'),
  es = require("event-stream"),
  transform = require('stream-transform'),
  dictionary = require('./code-lookup.js'),
  instructions = require('./instruction-lookup.js');

var headerLength = 0;

module.exports = {

  /*
   * Process the file to output the columns required for the algorithm
   * PATID | DATE | TABS | TABSPERDAY | DOSE | DRUGFAMILY | DRUGTYPE
   */
  process: function(file, columnTypes, isHeader, callback) {
    if (!file) {
      return callback(new Error("No file name specifiec"));
    }

    dictionary.load(true, function() {
      instructions.load(true, function() {
        //convert from array
        var cols = {};
        columnTypes.forEach(function(el, idx) {
          cols[el] = idx;
        });

        var s, els, columns = [],
          options = {};

        if (isHeader) options.start = headerLength+2;

        var parser = parse({
          delimiter: '\t',
          trim: true,
          quote: ""
        });

        var transformer = transform(function(data, callback) {
          setImmediate(function() {
            var rtn = [null]; //, data[0] + '\t' + find(data[0]) + "\n"];
            var row = [
              data[cols[constants.PATIENT_ID]],
              data[cols[constants.DATE]],
              data[cols[constants.TABLETS_PRESCRIBED]]
            ];

            if (!cols[constants.TABLETS_PER_DAY]) {
              row.push(instructions.find(data[cols[constants.INSTRUCTION]]));
            } else {
              row.push(data[cols[constants.TABLETS_PER_DAY]]);
            }

            if (cols[constants.DRUG_FAMILY] && cols[constants.DRUG_TYPE] && cols[constants.DOSE]) {
              row.push(data[cols[constants.DOSE]]);
              row.push(data[cols[constants.DRUG_FAMILY]]);
              row.splice(1, 0, data[cols[constants.DRUG_TYPE]]);
              rtn.push(row.join("\t")+"\n");
            } else {
              var o = dictionary.find(data[cols[constants.CLINICAL_CODE]]);
              o.forEach(function(el){
                var newrow = row.slice();
                newrow.push(el.dose);
                newrow.push(el.family);
                newrow.splice(1, 0, el.type);
                rtn.push(newrow.join("\t")+"\n");
              });
            }

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
          return callback(err);
        });

        console.time('Elapsed');

        var input = fs.createReadStream(file, options);
        var output = fs.createWriteStream(file + '.done');
        output.on('finish', function() {
          console.timeEnd('Elapsed');
		  var failedRegex = instructions.failed();
		  fs.writeFileSync('undefinedRegexes.txt', JSON.stringify(Object.keys(failedRegex).map(function(v){return [v,failedRegex[v][0],failedRegex[v][1]];}), null, 2));
          return callback(null);
        });

        input.pipe(parser).pipe(transformer).pipe(output);
      });
    });
  },

  columns: function(file, n, callback) {
    if (!file) {
      return callback(new Error("No file name specifiec"));
    }

    var s, els, columns = [],
      rows = 0;

    s = fs.createReadStream(file, {})
      .pipe(es.split())
      .pipe(es.mapSync(function(line) {
          // pause the readstream
          s.pause();
          rows++;
          if (rows === 1) headerLength = line.length;
          if (rows > n) s.destroy();
          (function() {
            // process line here and call s.resume() when rdy
            line.split('\t').forEach(function(elem, idx) {
              if (!columns[idx]) columns.push([]);
              columns[idx].push(elem);
            });

            // resume the readstream
            s.resume();
          })();
        })
        .on('error', function(err) {
          //if (log) console.log('Error while reading file.');
          callback(err);
        })
        .on('end', function() {
          //end of file reached
          callback(null, columns);
        })
        .on('close', function() {
          //stream destroyed
          callback(null, columns);
        })
      );
  }

};
