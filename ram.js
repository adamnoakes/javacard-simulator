function RAM(){
	this.transient_data = [];
	this.gRef = undefined;
	this.asyncstate = false;
	this.transaction_flag = false;
	this.transaction_buffer = [];
	this.select_statement_flag = 0;
	this.installation_failed = false;
}

exports.RAM = RAM;