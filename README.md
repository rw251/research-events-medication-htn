# Hypertension medication to meaningful events

[![travis][travis-image]][travis-url]
[![david-dm][david-dm-image]][david-dm-url]
[![codecov][codecov-image]][codecov-url]
[![bitHound][bithound-image]][bithound-url]

  Mining meaningful hypertension medication events from routinely collected EHR data.

## Introduction
Primary care research databases derived from UK electronic health records (EHRs) contain coded prescription information. Much of this information is unstructured or unordered, and interpretation is required to assign clinical meaning to it.

Here is an algorithm for constructing meaningful prescription events from primary care electronic health records. These events detail the initiation, termination and alteration of antihypertensive therapy, and are useful for further analyses.

## Usage
This was built, tested and executed against Microsoft SQL Server on Windows, however the code for execution on Linux with MySQL is also included.  This hasn't been tested to the same degree and should be checked if executing in this setup.

### Pre-requisites
1. Perl
2. SQL Server 2008 or higher (or alternative database)
3. nodejs ≥ 0.10.0 (https://nodejs.org)
4. git (https://git-scm.com/)

### Quick start

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

# Notes



### Execution (Windows)

```sh
$ execute.bat
```

### Execution (Linux)

```sh
$ execute.sh
```

## References

[travis-url]: https://travis-ci.org/rw251/research-events-medication-htn
[travis-image]: https://travis-ci.org/rw251/research-events-medication-htn.svg?branch=master
[david-dm-image]: https://david-dm.org/rw251/research-events-medication-htn.svg
[david-dm-url]: https://david-dm.org/rw251/research-events-medication-htn
[codecov-image]: https://codecov.io/github/rw251/research-events-medication-htn/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/rw251/research-events-medication-htn?branch=master
[bithound-image]: https://www.bithound.io/github/rw251/research-events-medication-htn/badges/score.svg
[bithound-url]: https://www.bithound.io/github/rw251/research-events-medication-htn
