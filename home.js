parameters = {};
vnets = {};
pips = {};
lbs = {};
nics = {};
sas = {};
vms = {};
vmsses = {};

function commitsDivHtml(which) {
    ret =
	'<div id="commits">' +
	'  <button class="btn btn-default" onclick="javascript:addBlock(\'' + which + '\')">Add</button>' +
	'  <button class="btn btn-default" onclick="javascript:nixBlock()">Cancel</button>' +
	'</div>';

    return ret;
}

function populateDetails(which) {
    detailsHtml = "<hr/><div class='subtitle'>" + "NEW " + which + "</div><br/><br/>";

    switch (which) {
    case "VNET":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-12'>" + 
	    "    optional naming infix (distinguishes VNETs): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "</div>";

	break;

    case "PIP":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (distinguishes PIPs): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-6'>" + 
	    "    opional domain label: <input id='domainLabel'></input>" +
	    "  </div> " +
	    "</div>";
	
	break;

    case "NIC":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (distinguishes NICs): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    subnet: " +
	    "    <select id='subnet'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    optional public ip: " +
	    "    <select id='pip'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "      <option value='generate for me'>none</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "</div>";

	break;

    case "LB":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-12'>" + 
	    "    optional naming infix (distinguishes LBs): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "</div>" +
	    "<div class='row'>" +
	    "<br/>" +
	    "<br/>" +
	    "<div class='subtitle'>Optional Round Robin Rules</div>" +
	    "<br/>" +
	    "</div>" +
	    "<div class='row'>" +
	    "  <div class='col-md-4'>" + 
	    "    front end port: <input id='roundRobinFrontEndPort'></input>" +
	    "  </div> " +
	    "  <div class='col-md-4'>" + 
	    "    back end port: <input id='roundRobinBackEndPort'></input>" +
	    "  </div> " +
	    "  <div class='col-md-4'>" + 
	    "    probe port: <input id='roundRobinProbePort'></input>" +
	    "  </div> " +
	    "</div>" +
	    "<div class='row'>" +
	    "<br/>" +
	    "<br/>" +
	    "<div class='subtitle'>Optional NAT Rules</div>" +
	    "<br/>" +
	    "</div>" +
	    "<div class='row'>" +
	    "  <div class='col-md-4'>" + 
	    "    front end starting port: <input id='NATFrontEndStartingPort'></input>" +
	    "  </div> " +
	    "  <div class='col-md-4'>" + 
	    "    front end ending port: <input id='NATFrontEndEndingPort'></input>" +
	    "  </div> " +
	    "  <div class='col-md-4'>" + 
	    "    back end port: <input id='NATBackEndPort'></input>" +
	    "  </div> " +
	    "</div>";
	break;

    case "SA":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (distinguishes SAs): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    type: " +
	    "    <select id='subnet'>" +
	    "      <option value='Standard_LRS'>Standard_LRS</option>" +
	    "      <option value='Standard_GRS'>Standard_GRS</option>" +
	    "      <option value='Standard_RAGRS'>Standard_RAGRS</option>" +
	    "      <option value='Premium_LRS'>Premium_LRS</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    number of sas: <input id='numsas'></input>" +
	    "  </div> " +
	    "</div>";
	break;

    case "VM":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" +
	    "    optional naming infix (distinguishes VMs): <input id='namingInfix'></input>" +
	    "  </div>" +
	    "  <div class='col-md-3'>" + 
	    "    number of vms: <input id='numVMs'></input>" +
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    size: " +
	    "    <select id='size'>" +
	    "      <option value='Standard_A1'>Standard_A1</option>" +
	    "      <option value='Standard_A2'>Standard_A2</option>" +
	    "      <option value='Standard_A3'>Standard_A3</option>" +
	    "      <option value='Standard_A4'>Standard_A4</option>" +
	    "      <option value='Standard_D1'>Standard_D1</option>" +
	    "      <option value='Standard_D2'>Standard_D2</option>" +
	    "      <option value='Standard_D3'>Standard_D3</option>" +
	    "      <option value='Standard_D4'>Standard_D4</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "</div>" +
	    "<br/>" +
	    "<div class='row'>" +
	    "  <div class='col-md-4'>" + 
	    "    OS: " +
	    "    <select id='os'>" +
	    "      <option value='Linux'>Linux</option>" +
	    "      <option value='Windows'>Windows</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-4'>" +
	    "    admin username: <input id='admin username'></input>" +
	    "  </div>" +
	    "  <div class='col-md-4'>" +
	    "    admin password: <input id='admin password'></input>" +
	    "  </div>" +
	    "</div>" +
	    "<br/>" +
	    "<div class='row'>" +
	    "  <div class='col-md-4'>" +
	    "    nic: " +
	    "    <select id='nic'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-4'>" +
	    "    storage account: " +
	    "    <select id='sa'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-4'>" +
	    "    boot diagnostics: <input type='checkbox' id='bootDiagnostics'></input>" +
	    "  </div>" +
	    "</div>";
	break;

    case "VMSS":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" +
	    "    optional naming infix (distinguishes VMSSes): <input id='namingInfix'></input>" +
	    "  </div>" +
	    "  <div class='col-md-3'>" + 
	    "    number of vmsses: <input id='numVMSS'></input>" +
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    target instance count per vmss: " +
	    "    <input id='targetInstanceCount'></input>" +
	    "  </div>" +
	    "</div>" +
	    "<br/>" +
	    "<div class='row'>" +
	    "  <div class='col-md-3'>" + 
	    "    vm size: " +
	    "    <select id='size'>" +
	    "      <option value='Standard_A1'>Standard_A1</option>" +
	    "      <option value='Standard_A2'>Standard_A2</option>" +
	    "      <option value='Standard_A3'>Standard_A3</option>" +
	    "      <option value='Standard_A4'>Standard_A4</option>" +
	    "      <option value='Standard_D1'>Standard_D1</option>" +
	    "      <option value='Standard_D2'>Standard_D2</option>" +
	    "      <option value='Standard_D3'>Standard_D3</option>" +
	    "      <option value='Standard_D4'>Standard_D4</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "  <div class='col-md-3'>" + 
	    "    OS: " +
	    "    <select id='os'>" +
	    "      <option value='Linux'>Linux</option>" +
	    "      <option value='Windows'>Windows</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    admin username: <input id='admin username'></input>" +
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    admin password: <input id='admin password'></input>" +
	    "  </div>" +
	    "</div>" +
	    "<br/>" +
	    "<div class='row'>" +
	    "  <div class='col-md-3'>" +
	    "    subnet: " +
	    "    <select id='subnet'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    round-robin lb: " +
	    "    <select id='lb'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "      <option value='none'>none</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    nat rules: " +
	    "    <select id='natRules'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "      <option value='none'>none</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    storage accounts: " +
	    "    <select id='sas'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "</div>";
	break;
    }

    detailsHtml += "<br/>" + commitsDivHtml(which) + "<hr/>";

    $('#details').html(detailsHtml);

    populateSelectors(which);
}

function success(which) {
    $('#details').html('Added ' + which + "!");
}

function populateSelectors(which) {
    switch (which) {
    case "NIC":
	for (vnet in vnets) {
	    value = "already-created-vnet-subnet-" + vnet;
	    option = "<option value='" + value + "'>" +
		value + "</option>";
	    $("#subnet").append(option);
	}

	for (pip in pips) {
	    value = "already-created-pip-" + pip;
	    option = "<option value='" + value + "'>" +
		value + "</option>";
	    $("#pip").append(option);
	}
	
	break;
    }

}

function addBlock(which) {
    switch (which) {
    case "VNET":
	infix = $('#namingInfix').val();

	if (infix in vnets) {
	    alert('There is already a vnet with infix"' + infix + '"! please choose a different infix, or edit/delete the other vnet.');
	    break;
	}

	vnets[infix] = {};
	success(which);
	break;

    case "PIP":
	infix = $("#namingInfix").val();
	domainLabel = $('#domainLabel').val();

	if (infix in pips) {
	    alert('There is already a pip with infix"' + infix + '"! please choose a different infix, or edit/delete the other pip.');
	    break;
	}

	pips[infix] = {"domainLabel": domainLabel};
	success(which);
	break;

    case "NIC":
	infix = $("#namingInfix").val();
	subnet = $("#subnet").val();
	pip = $("#pip").val();

	if (infix in nics) {
	    alert('There is already a nic with infix "' + infix + '"! please choose a different infix, or edit/delete the other nic.');
	    break;
	}

	nics[infix] = {"subnet": subnet,
		       "pip": pip};
	success(which);
	break;

    case "LB":
	infix = $("namingInfix").val();

	roundRobinFrontEndPort = parseInt($("roundRobinFrontEndPort").val());
	roundRobinBackEndPort = parseInt($("roundRobinBackEndPort").val());
	roundRobinProbePort = parseInt($("roundRobinProbePort").val());

	NATFrontEndStartingPort = parseInt($("NATFrontEndStartingPort").val());
	NATFrontEndEndingPort = parseInt($("NATFrontEndEndingPort").val());
	NATBackEndPort = parseInt($("NATBackEndPort").val());

	if (infix in lbs) {
	    alert('There is already a lb with infix "' + infix + '"! please choose a different infix, or edit/delete the other lb.');
	    break;
	}
	
	allRREmpty =
	    isNaN(roundRobinFrontEndPort) &&
	    isNaN(roundRobinBackEndPort) &&
	    isNaN(roundRobinProbePort);

	allRRSpecified = 
	    (!isNaN(roundRobinFrontEndPort)) &&
	    (!isNaN(roundRobinBackEndPort)) &&
	    (!isNaN(roundRobinProbePort));

	allRR = allRREmpty || allRRSpecified;
	
	if (!allRR) {
	    alert('Some round robin rule properties are specified and others not! Please either specify all of them or none of them.');
	    break;
	}

	allNATEmpty =
	    isNaN(NATFrontEndStartingPort) &&
	    isNaN(NATFrontEndEndingPort) &&
	    isNaN(NATBackEndPort);

	allNATSpecified =
	    (!isNaN(NATFrontEndStartingPort)) &&
	    (!isNaN(NATFrontEndEndingPort)) &&
	    (!isNaN(NATBackEndPort));

	allNAT = allNATEmpty || allNATSpecified;
	
	if (!allNat) {
	    alert('Some NAT rule properties are specified and others not! Please either specify all of them or none of them.');
	    break;
	}
	
	lbs[infix] = {"roundRobinFrontEndPort": roundRobinFrontEndPort,
		       "roundRobinBackEndPort": roundRobinBackEndPort,
		       "roundRobinProbePort": roundRobinProbePort,
		       "NATFrontEndStartingPort": NATFrontEndStartingPort,
		       "NATFrontEndEndingPort": NATFrontEndEndingPort,
		       "NATBackEndPort": NATBackEndPort};
	success(which);
	break;

    case "SA":
	alert('TODO!');
	break;

    case "VM":
	alert('TODO!');
	break;

    case "VMSS":
	alert('TODO!');
	break;
    }
}

function nixBlock() {
    $('#details').html("");
}