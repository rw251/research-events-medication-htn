use strict;
use warnings;

use Time::Piece;
use Time::Seconds;
use Data::Dumper;

my $format = '%Y-%m-%d';

#Variable parameters
my $rxLengthProportion = 0.75;
my $adherenceProportion = 10000;
my $terminationProportion = 5;
my $extractDate = Time::Piece->strptime("2014-12-15", $format);
my $limit = 100000000;

my @statements;
my @standard;
my @vals;
my $output;

my $pid;
my $dt;
my $tabs;
my $perDay;
my $mg;
my $family;
my $type;

my $pidLast=-1;
my $dtLast;
my $tabsLast;
my $perDayLast="";
my $mgLast="";
my $familyLast;
my $typeLast="";

my $pidChg=-1;
my $dtChg;
my $tabsChg;
my $perDayChg;
my $mgChg;
my $familyChg;
my $typeChg;


my %types=();
my @patientEvents=();
my @patientTypeCache=();
my $debug = 0;

###############################
# Adds an event to the list   #
###############################
sub addToList {
	my ($pid, $dt, $item) = @_;

	if(ref($dt) eq "Time::Piece") {
		$dt = $dt->strftime($format);
	}

	my %hash = (id => $pid,dt => "$dt 04:00:00",item => $item);

	if($debug){
		print "OUT: $pid\t$dt 04:00:00\t$item\n";
	}
	push(@patientEvents, \%hash);
}

###############################
# Sorts the list of events and#
# concatenates to a single    #
# variable - $output          #
###############################
sub writeOutput {
	my @sorted = sort { $a->{id} <=> $b->{id} or $a->{dt} cmp $b->{dt}} @patientEvents;
	$output .= "$_->{id}\t$_->{dt}\t$_->{item}\n" foreach (@sorted);
}

###############################
# Helper to return number of  #
# types.                      #
###############################
sub noTypes{
	return (scalar keys %types);
}

###############################
# Checks if the last drug has #
# expired and if so adds a    #
# drug termination event      #
###############################
sub isDrugStopped {
	my ($pid, $type, $testDate) = @_;

	if($debug) {
		print "isDrugStopped\t$pid\t$type\t$testDate\n";
	}

	if($types{"expChk"} < $testDate) {
		if($debug) {
			print "STOPPED:\tEXPCHK:" .$types{"expChk"} . "\tEXP:" .$types{"exp"} . "\tTEST:$testDate\n";
		}
		addToList($pid,$types{"exp"},"$type STOPPED");
		%types = ();
	}
}

###############################
# Adds a new drug type to the #
# list.                       #
###############################
sub newType{
	my ($family, $type, $dt, $perDay, $mg, $tabs, $pid) = @_;
	if($debug) {
		print "newType\t$family\t$type\t$dt\t$perDay\t$mg\t$tabs\t$pid\n";
	}
	if($perDay eq ""){
		$perDay = 1;
	}
	#New type
	addToList($pid,$dt,"$type STARTED");

	#Add type as well
	%types=();
	my $dtExpires = $dt + (ONE_DAY*$tabs/$perDay);
	my $dtExpLong = $dt + ($rxLengthProportion*ONE_DAY*$tabs/$perDay);
	my $dtExpChck = $dt + ($terminationProportion*ONE_DAY*$tabs/$perDay);
	my $dose = $mg*$perDay;

	if($debug){
		print $dtExpLong->strftime($format) . "\t" . $dtExpires->strftime($format) . "\t" . $dtExpChck->strftime($format) . "\n";
	}

	%types = (exp => $dtExpires, expLong => $dtExpLong, expChk => $dtExpChck, dose => $dose);
}

###############################
# Logic to determin the tabs  #
# to be taken per day if the  #
# value is empty.             #
###############################
sub getPerDay{
	my ($perDay, $perDayLast, $type, $typeLast, $mg, $mgLast) = @_;

	if($perDay eq ""){
		if($type eq $typeLast && $mg eq $mgLast) {
			$perDay = $perDayLast;
		} else {
			$perDay = 1;
		}
	}

	if($debug){
		print "$perDay\t$perDayLast\t$type\t$typeLast\t$mg\t$mgLast\n";
	}

	return $perDay;
}

sub populateVariablesFromHash{
	my (%hash) = @_;
	$pid = $hash{"pid"};
	$dt = $hash{"dt"};
	$tabs = $hash{"tabs"};
	$perDay = $hash{"perDay"};
	$mg = $hash{"mg"};
	$family = $hash{"family"};
	$type = $hash{"type"};
}

###############################
# Takes all drugs of a certain#
# type and evaluates the stop #
# start and dose change events#
###############################
sub evaluate{
	#cache existing values
	my $pidTmp = $pid;
	my $dtTmp = $dt;
	my $tabsTmp = $tabs;
	my $perDayTmp = $perDay;
	my $mgTmp = $mg;
	my $familyTmp = $family;
	my $typeTmp = $type;
	$pidLast=-1;
	$dtLast="";
	$tabsLast="";
	$perDayLast="";
	$mgLast="---";
	$familyLast="";
	$typeLast="";
	for(my $i = 0; $i<= $#patientTypeCache; $i++)
	{
		my %event = %{$patientTypeCache[$i]};
		populateVariablesFromHash(%event);
		if($perDay eq ""){
			if($mg eq $mgLast) {
				$perDay = $perDayLast;
			} elsif($i< $#patientTypeCache) {
				my $j = 1;
				while($i+$j <= $#patientTypeCache){
					%event = %{$patientTypeCache[$i+$j]};
					$j++;
					if($event{"perDay"} ne "") {
						if($mg eq $event{"mg"}){
							$perDay = $event{"perDay"};
							last;
						} else {
							$perDay = 1;
							last;
						}
					} elsif ($mg ne $event{"mg"}){
						$perDay = 1;
						last;
					} else {
					}
				}

				if($perDay eq "") {
					$perDay = 1;
				}

			} else {
				$perDay = 1;
			}
		}

		if($debug){
			print "$family, $type, $dt, $perDay, $mg, $tabs, $pid\n";
		}

		if($i==0) {
			newType($family, $type, $dt, $perDay, $mg, $tabs, $pid);
		}
		isDrugStopped($pid, $type, $dt);
		my $dtExpires = $dt + (ONE_DAY*$tabs/$perDay);
		my $dtExpLong = $dt + ($rxLengthProportion*ONE_DAY*$tabs/$perDay);
		my $dtExpChck = $dt + ($terminationProportion*ONE_DAY*$tabs/$perDay);
		my $dose = $mg*$perDay;
		if(!$types{"exp"}) {
			#Must have been a big gap
			addToList($pid,$dt,"$type RESTARTED");
		} else {
			if($dose > $types{"dose"}){
				#If an increase then we assume an actual increase
				addToList($pid,$dt,"$type DOSE INCREASED");

				###$types{$type} = $mg*$perDay;
			} elsif ($dose < $types{"dose"}){
				if($dt >= $types{"expLong"}){
					#if a decrease and near to or after the last one expires then consider a decrease
					addToList($pid,$dt,"$type DOSE DECREASED");
					$dose = $mg*$perDay;
				} else {

					#else if a decrease during the last prescription...
					($pidChg, $dtChg, $tabsChg, $perDayChg, $mgChg, $familyChg, $typeChg) =($pid, $dt, $tabs, $perDay, $mg, $family, $type);
					my $index = $i;
					my %mgs = ();

					my $first = $types{"dose"};
					my $second = $dose;
					my $last = $second;
					my $lastDate = $dt;
					my $third = 0;
					my $lastPerDay = $perDay;
					my $lastTabs = $tabs;

					#keep track of different amounts
					$mgs{$first}++;
					$mgs{$second}++;

					$i++;

					while($i < $index+5 && $i <= $#patientTypeCache){
						%event = %{$patientTypeCache[$i]};
						populateVariablesFromHash(%event);
						$perDay = getPerDay($perDay, $lastPerDay, $type, $type, $mg, $mgChg);

						if($debug) {
							print "$i\n";
						}
						if($mg eq "" || $family eq "" || $type eq "") {
							$i++;
							next;
						}

						$mgs{$mg*$perDay}++;

						if($last == $mg*$perDay){
							#sustatined decrease
							last;
						}

						$last = $mg*$perDay;
						$lastDate = $dt;
						$lastTabs = $tabs;
						$lastPerDay = $perDay;
						$i++;
					}

					if($mgs{$first+$second}){
						#looks like the two meds are taken together so an increase on first prescription
						addToList($pidChg,$dtChg,"$type DOSE INCREASED");
						$dose = $first+$second;
					} elsif ($mgs{$first} > 1 && $mgs{$second} == 1) {
						#a change then a change back
						if($first > $second) {
							addToList($pidChg,$dtChg,"$typeChg DOSE DECREASED");
							addToList($pidChg,$lastDate,"$typeChg DOSE INCREASED");
						} else {
							addToList($pidChg,$dtChg,"$typeChg DOSE INCREASED");
							addToList($pidChg,$lastDate,"$typeChg DOSE DECREASED");
						}
						$dose = $first;
					} elsif ($mgs{$first} == 1 && $mgs{$second} >= 1) {
						#a change
						if($first > $second) {
							addToList($pidChg,$dtChg,"$typeChg DOSE DECREASED");
							if($last > $second){
								addToList($pid,$lastDate,"$typeChg DOSE INCREASED");
							} elsif($last < $second) {
								addToList($pid,$lastDate,"$typeChg DOSE DECREASED");
							}
						} else {
							addToList($pidChg,$dtChg,"$typeChg DOSE INCREASED");
						}
						$dose = $last;
					} elsif($last == $second){
						#a change
						if($first > $second) {
							addToList($pidChg,$dtChg,"$typeChg DOSE DECREASED");
						} else {
							addToList($pidChg,$dtChg,"$typeChg DOSE INCREASED");
						}
						$dose = $last;
					} elsif($last == $first){
						#a change
						if($first > $second) {
							addToList($pidChg,$dtChg,"$typeChg DOSE INCREASED");
						} else {
							addToList($pidChg,$dtChg,"$typeChg DOSE DECREASED");
						}
						$dose = $last;
					} else {
						addToList($pidChg,$dt,"DRUG-ERROR-2000");
						print Dumper(%mgs) . "\n";
					}

					$dtExpires = $dt + (ONE_DAY*$tabs/$perDay);
					$dtExpLong = $dt + ($rxLengthProportion*ONE_DAY*$tabs/$perDay);
					$dtExpChck = $dt + ($terminationProportion*ONE_DAY*$tabs/$perDay);
				}
			} else {
				#no change - insert no events
			}
		}

		%types = (exp => $dtExpires, expLong => $dtExpLong, expChk => $dtExpChck, dose => $dose);
	}
	if($pid>=0 && $type ne ""){
		isDrugStopped($pid, $type, $extractDate);
	}
	@patientTypeCache=();
	$pid = $pidTmp;
	$dt = $dtTmp;
	$tabs = $tabsTmp;
	$perDay = $perDayTmp;
	$mg = $mgTmp;
	$family = $familyTmp;
	$type = $typeTmp;
}

#get filename from args exit if none

if($#ARGV != 0) {
	print "\nUsage: parse_drug_file.pl [path_to_data_file]\n\n\n";
    exit;
}
print "Reading file...\n";
open my $fh, '<', "$ARGV[0]" or die "Cannot open $ARGV[0]: $!";
#my $header = <$fh>; #No header
my $ix = 0;
while (<$fh> ) {
	chomp;

	($pid, $type, $dt, $tabs, $perDay, $mg, $family) = split /\t/, $_;

	if($debug){
		print "$pid:$dt:$tabs:$perDay:$mg:$family:$type\n"
	}

	if($ix>11165000) {
		$debug=1;
		print "DEBUG\n";
	}
	if($ix++ > $limit) {
		last;
	}

	###Pull out just one patients:
	#$debug=1;
	#if($pid != 1030) {
	#	next;
	#}

	if($dt =~ /^18/) {
		#ignore record if date is <1900
		print "$dt\n";
		next;
	}
	$dt = Time::Piece->strptime($dt, $format);

	if($mg eq "" || $family eq "" || $type eq "") {
		next;
	}

	if($pid != $pidLast || $type ne $typeLast){
		evaluate();
	}

	my %event = (pid=>$pid, dt=>$dt, tabs=>$tabs, perDay=>$perDay, mg=>$mg, family=>$family, type=>$type);
	if($debug){
		print "$pid\t$type\t$mg\t$#patientTypeCache\n";
	}
	push(@patientTypeCache, \%event);

	($pidLast, $dtLast, $tabsLast, $perDayLast, $mgLast, $familyLast, $typeLast) =($pid, $dt, $tabs, $perDay, $mg, $family, $type);
}

evaluate();

writeOutput();

close($fh);
print "File processed.\n\n";

print "Writing output...\n\n";

open $fh, '>', "$ARGV[0].processed" or die "Cannot open $ARGV[0].processed: $!";
print $fh $output;
close ($fh);

print "Done!\n";
