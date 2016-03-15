/* jshint node: true */
"use strict";

var sqlite3 = require('sqlite3'),
  path = require('path'),
  fs = require('fs'),
  util = require('util'),
  stream = require('stream'),
  es = require("event-stream");

module.exports = {
  loadCodes: function(callback) {
    var start, s, els, db = new sqlite3.Database(path.join('db', 'dictionary.sqlite')),
      files = fs.readdirSync('resources');
    db.serialize(function() {

      db.run('DROP TABLE IF EXISTS codeLookup');
      db.run('CREATE TABLE codeLookup (code VARCHAR, family VARCHAR, type VARCHAR, dose FLOAT, description VARCHAR)');

      start = Date.now();

      files.forEach(function(file) {
        if (file.indexOf("drug-codes") < 0) {
          if (file === files[files.length - 1]) {
            db.run("begin transaction");
            db.run('CREATE INDEX clCode ON codeLookup (code)');
            db.run("commit");
          }
          return;
        }

        db.run("begin transaction");
        var stmt = db.prepare("INSERT OR IGNORE INTO codeLookup (code, family, type, dose, description) VALUES (?,?,?,?,?)");

        s = fs.createReadStream(path.join('resources', file), {start: 39}) //skips header assuming it is "CODE	FAMILY	TYPE	DOSE(mg)	DESCRIPTION"
          .pipe(es.split())
          .pipe(es.mapSync(function(line) {
              // pause the readstream
              s.pause();
              (function() {
                // process line here and call s.resume() when rdy
                els = line.split('\t');
                if(els.length===5)
                  stmt.run(els[0], els[1], els[2], els[3], els[4]);
                // resume the readstream
                s.resume();
              })();
            })
            .on('error', function() {
              console.log('Error while reading file.');
            })
            .on('end', function() {
              console.log('Read entirefile.');
            })
          );

        if (file === files[files.length - 1]) {
          db.run('CREATE INDEX clCode ON codeLookup (code)');
        }
        db.run("commit");
      });
    });

    db.close(function() {
      console.log("Elapsed: " + (Date.now() - start) + "ms");
      callback(null);
    });
  }
};
