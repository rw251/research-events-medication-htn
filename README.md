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
- Perl
- SQL Server 2008 or higher (or alternative database)

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
