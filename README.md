# Hypertension medication to meaningful events


[![Dependency Status](https://david-dm.org/rw251/research-events-medication-htn.svg)](https://david-dm.org/rw251/research-events-medication-htn)

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
