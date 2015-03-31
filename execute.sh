#!/bin/bash

read -p "Enter DB (default SIR2)" DB
DB=${name:-SIR2}

#Create query
perl populate_query_with_codes.pl

#Run query to create view
mysql $DB < queries/create_view_for_extract-drugs.mysql.sql

#Extract the data
mysql $DB < queries/create_view_for_extract-drugs-out.mysql.sql > out/data.dat

#Process the data
perl parse_drug_file.pl out/data.dat