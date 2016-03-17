/* jshint node: true */
"use strict";

var dictionary = require('./scripts/code-lookup.js'),
  instructions = require('./scripts/instruction-lookup.js'),
  pkg = require('./package.json'),
  program = require('commander'),
  main = require('./scripts/main.js'),
  inquirer = require('inquirer'),
  constants = require('./scripts/const.js');

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
  main.columns(program.processAll, 5, function(err, columns) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    inquirer.prompt({
      type: "confirm",
      message: "Is this a header row: " + columns.map(function(el) {
        return el[0];
      }).join("|"),
      name: "confirm",
      default: true
    }, function(val) {
      var isHeader = val.confirm;

      var columnTypes = [];
      var hasCode = false;
      var hasInstructionOrTabsPerDay = false;
      var choices = [{
        name: "Patient identifier",
        value: constants.PATIENT_ID
        }, {
        name: "Date of the prescription",
        value: constants.DATE
        }, {
        name: "Number of tablets prescribed",
        value: constants.TABLETS_PRESCRIBED
        }, {
        name: "Clinical code",
        value: constants.CLINICAL_CODE
        }, {
        name: "Drug family (e.g. Beta blocker, ACE Inhibitor, Loop diuretic)",
        value: constants.DRUG_FAMILY
        }, {
        name: "Drug active ingredient (e.g. Propranolol, Captropril, Amlodipine)",
        value: constants.DRUG_TYPE
        }, {
        name: "Dose per tablet in mg",
        value: constants.DOSE
        }, {
        name: "Prescription instruction (e.g. take one daily, 2 twice a day, one in the morning)",
        value: constants.INSTRUCTION
        }, {
        name: "Tablets per day",
        value: constants.TABLETS_PER_DAY
        }, {
        name: "None of the above (this column will therefore be ignored)",
        value: constants.IGNORE
      }];

      var q = function() {
        var head;
        if(isHeader) {
          head = columns[0].shift();
        }
        inquirer.prompt({
          type: "list",
          choices: choices,
          message: "Please identify the elements in the column " + (head ? "with header '"+ head + "' " :"") + "containing: \n" + JSON.stringify(columns[0]),
          name: "col"
        }, function(val) {
          columns.shift();
          if (val.col === constants.CLINICAL_CODE) hasCode = true;
          if (val.col === constants.INSTRUCTION || val.col === constants.TABLETS_PER_DAY) hasInstructionOrTabsPerDay = true;
          columnTypes.push(val.col);
          choices = choices.filter(function(v) {
            return v.value === constants.IGNORE || v.value !== val.col;
          });
          if (columns.length > 0) {
            q();
          } else {

            var isOk = true;
            //Check for essential columns
            choices.forEach(function(el) {
              if (el.value === constants.PATIENT_ID) {
                isOk = false;
                console.log("Your data does not contain a patient identifier - this is necessary for the algorithm to work correctly.");
              } else if (el.value === constants.DATE) {
                isOk = false;
                console.log("Your data does not contain a prescription date - this is necessary for the algorithm to work correctly.");
              } else if (el.value === constants.TABLETS_PRESCRIBED) {
                isOk = false;
                console.log("Your data does not contain the number of tablets prescribed - this is necessary for the algorithm to work correctly.");
              }
            });

            //check for type
            if (!hasCode && columnTypes.filter(function(v) {
                return [constants.DRUG_TYPE, constants.DOSE].indexOf(v) > -1;
              }).length !== 2) {
              isOk = false;
              console.log("Your must contain either a clinical code - or a drug active ingredient and dose for the algorithm to work correctly.");
            }
            if (!hasInstructionOrTabsPerDay) {
              isOk = false;
              console.log("Your must contain either an instruction or the number of tabs per day for the algorithm to work correctly.");
            }

            if (isOk) {
              main.process(program.processAll, columnTypes, isHeader, function(err) {
                if (err) {
                  console.log(err);
                  process.exit(1);
                }

                console.log("All completed successfully");
                process.exit(0);
              });
            } else {
              process.exit(1);
            }
          }
        });
      };

      q();
    });

  });
} else {
  console.error('no command given!');
  program.help();
}
