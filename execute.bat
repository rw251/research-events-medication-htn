echo off

set DB=SIR2
set /p db=Enter DB (default SIR2):

rem Create query
perl populate_query_with_codes.pl

pause

rem Run query to create view
sqlcmd -E -d %DB% -i queries/create_view_for_extract-drugs.sql

rem Extract the data
bcp "select patid, date, numberTabs, tabsPerDay, sum(mgPerTab) as mgPerDay, case when family = 'ACEI' or family = 'ARB' then 'ACEI/ARB' when family = 'DIUR_LOOP' or family = 'DIUR_POT' then 'DIUR_OTH' else family end as family, type from %DB%.dbo.TEMP__VIEW__DRUGS group by patid, date, numberTabs, tabsPerDay, family, type order by patid, family, type, date" queryout out/data.dat -c -T -b 10000000

perl parse_drug_file.pl out/data.dat
pause