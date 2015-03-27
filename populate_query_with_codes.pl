use strict;
use warnings;

my @statements;
my @standard;

sub readFile{
	my (%args) = @_;
	
	@statements=();
	@standard=();
	
	print "Reading file...\n";
	open my $fh, '<', $args{'filename'} or die "Cannot open $args{'filename'}: $!";
	my $header = <$fh>;
	while (<$fh> ) {
		chomp;
		my $val = (split( ",", $_ ))[1];
		if ($val =~ /%/ ) {
			push(@statements, "readcode like '$val'");
		} else {
			push(@standard, "'$val'");
		}
	}
	close($fh);
	print "Done.\n\n";
}

sub writeQuery{
	my (%args) = @_;
	
	if(@standard) {
		push(@statements, "readcode IN (" . join(',',@standard) . ")");
	}

	my $sql = "WHERE " . join(' OR ',@statements);
	
	open my $fh, '<', $args{'filename'} or die "Cannot open $args{'filename'}: $!";
	local $/;
	my $document = <$fh>; 
	close ($fh);
	
	$document =~s/\{\{query\}\}/$sql/gi;
	
	open $fh, '>', 'queries/create_view_for_extract' . $args{'suffix'} . '.sql' or die "Cannot open queries/create_view_for_extract' . $args{'suffix'} . '.sql: $!";
	print $fh $document;
	close ($fh);
	
	print "Done!\n";
}

#create output directories if not exists
if( !-d "./queries/"){
	mkdir "queries" or die "Failed to create the queries directory.";
}
if( !-d "./out/"){
	mkdir "out" or die "Failed to create the out directory.";
}

my %args = ('filename' => "codes/code-list-drugs.csv", 'suffix' => "-drugs");
readFile(%args);
$args{'filename'} = "templates/query-drugs.tmpl";
writeQuery(%args);