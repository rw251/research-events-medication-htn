# Hypertension medication to meaningful events

[![travis][travis-image]][travis-url]
[![david-dm][david-dm-image]][david-dm-url]
[![codecov][codecov-image]][codecov-url]
[![bitHound][bithound-image]][bithound-url]

  Mining meaningful hypertension medication events from routinely collected EHR data.

## Introduction
Primary care research databases derived from UK electronic health records (EHRs) contain coded prescription information. Much of this information is unstructured or unordered, and interpretation is required to assign clinical meaning to it.

Here is an algorithm for constructing meaningful prescription events from primary care electronic health records. These events detail the initiation, termination and alteration of antihypertensive therapy, and are useful for further analyses.

## Pre-requisites
1. Perl ≥ 5.22.0
2. nodejs ≥ 0.10.0 (https://nodejs.org)
3. git (https://git-scm.com/)

Earlier versions may work but are untested.

## Quick start

The following shows how to get up and running quickly using example data.

1. Open a command line prompt and clone this repository

        git clone https://github.com/rw251/research-events-medication-htn

2. Navigate into the newly created directory

        cd research-events-medication-htn

3. Install the dependencies

        npm install

4. Process some example data by following on screen instructions using

        npm run example

5. Output in `resources\example-data.txt.done.sorted.processed`

# Command line options
```
$ node index.js --help

  Usage: index [options]

  Options:

    -h, --help                         output usage information
    -V, --version                      output the version number
    -c, --process-codes <file>         Takes <file> with a list of codes, and outputs a file with code, drug family, drug type and dose(mg)
    -i, --process-instructions <file>  Takes <file> with a list of drug instructions (e.g. "take one a day"), and outputs a file with instruction and tablets per day
    -a, --process-all <file>           Takes <file> with a list of drug information and outputs the data necessary for the algorithm
```

# Usage
## Main algorithm
The main algorithm requires a tab separated input file containing the following fields:
- Patient id - any value will do provided it is consistent throughout the file
- Drug type - the active ingredient in the medication e.g. propranolol, captopril
- Date - the date of the prescription in the form YYYY-MM-DD
- Tablets - the number of tablets prescribed
- Tablets per day - the number of tablets to be taken each day
- Dose (mg) - the dose in milligrams in each tablet
- Drug family - not currently used but still a required field

The file should not contain a header row and should be sorted first by patient id, then by drug type and finally by date.

For medications that contain multiple active ingredients these should be entered on multiple lines - one for each active ingredient e.g. for 28 tablets of "Olmesartan medoxomil 20mg / Amlodipine 5mg" prescribed one a day on 10th January 2016 the file should contain:
```
[PATIENT_ID]   Amlodipine   2016-01-10   28   1   5    CCB
[PATIENT_ID]   Olmesartan   2016-01-10   28   1   20   ARB
```
The algorithm can be executed with:

        perl parse_drug_file.pl [path to input file]

The output is a tab separated file in the same location as the input, but suffixed with `.processed`. The file contains the following fields:
- Patient id
- Date
- Drug type
- Clinical decision event - either STARTED, STOPPED, DOSE INCREASED or DOSE DECREASED

## Supplementary programs
It may be necessary to pre process the data into a format acceptable to the algorithm. We provide tools for this.

In our case we obtained the drug type, family and dose from the clinical code. The lookup data for this is kept in `./resources` in files prefixed with `drug-codes-`. We also needed to convert the prescription instruction ('take one a day') into the number of tablets per day. This uses natural language processing via regular expressions which are kept in `./resources/regex.txt`.

Given a tab separated file containing some or all of the required fields, there is a command line tool to:
1. Determine if you have sufficient data for the algorithm
2. Process the data into a format acceptable to the algorithm

Execution is as follows:

        npm start -- -a [path to file]

A series of questions asks the user to indicate what is stored in each column and the output can be fed into the algorithm script detailed above. Sometimes it is necessary to sort the output of this preliminary step so it is recommended that this is always performed. This can be achieved with standard unix/windows commands but also easily with the following:

        npm run -s sort [path to input file] > [path to output file]

[travis-url]: https://travis-ci.org/rw251/research-events-medication-htn
[travis-image]: https://travis-ci.org/rw251/research-events-medication-htn.svg?branch=master
[david-dm-image]: https://david-dm.org/rw251/research-events-medication-htn.svg
[david-dm-url]: https://david-dm.org/rw251/research-events-medication-htn
[codecov-image]: https://codecov.io/github/rw251/research-events-medication-htn/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/rw251/research-events-medication-htn?branch=master
[bithound-image]: https://www.bithound.io/github/rw251/research-events-medication-htn/badges/score.svg
[bithound-url]: https://www.bithound.io/github/rw251/research-events-medication-htn
