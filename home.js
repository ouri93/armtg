// rev 3

/*
  The blocks object is essentially the object model for all blocks.
  
  Description of keys
  -------------------
  'plural': the plural form of the block type, used for interacting with the user

  'populatableSelectors': selectors for an object that should be a dropdown based on existing blocks

  'blocks': the currently created blocks of this type

  'properties': the user-specified aspects of blocks of this type

  'properties[property][type]': 'num', 'dropdown', 'text', 'vmSize', 'storageType', 'os', 'password', or 'checkbox'; determines the html element (view) that receives the user input, as well as the validation of this property (controller)

  'properties::required': true if required, false if not

  'properties::columnWidth': width of the column for that property; a single row has width of 12 (really belongs in a view of some sort but is convenient to have here); EACH ROW MUST ADD UP TO 12; THE VIEW-GENERATION CODE ASSUMES THIS; IF THE LAST ROW DOES NOT ADD UP TO 12, THE CLOSING </div> WON'T BE ADDED

  'cospecifications': a list of lists; adds validation that at least one of the sublists has all of its entries specified
*/
var blocks = {'PARAMETER': {'plural': 'parameters',
			    'populatableSelectors': {},
			    'blocks': {},
			    'properties': {},
			    'cospecifications': []},
	      
	      'VNET': {'plural': 'VNETs',
		       'populatableSelectors': {},
		       'blocks': {},
		       'properties': {},
		       'cospecifications': []},
	      
	      'PIP': {'plural': 'PIPs',
		      'populatableSelectors': {},
		      'blocks': {},
		      'properties': {'domainLabel': {'type': 'text', 'required': false, 'columnWidth': 12}},
		      'cospecifications': []},
	      
	      'NIC': {'plural': 'NICs',
		      'populatableSelectors': {'VNET': true, 'PIP': true},
		      'blocks': {},
		      'properties': {'VNET': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
				     'PIP': {'type': 'dropdown', 'required': false, 'columnWidth': 6}},
		      'cospecifications': []},
	      
	      'LB': {'plural': 'LBs',
		     'populatableSelectors': {},
		     'blocks': {},
		     'properties': {'roundRobinFrontEndPort': {'type': 'num', 'required': false, 'columnWidth': 4},
				    'roundRobinBackEndPort': {'type': 'num', 'required': false, 'columnWidth': 4},
				    'roundRobinProbePort': {'type': 'num', 'required': false, 'columnWidth': 4},
				    'NATFrontEndStartingPort': {'type': 'num', 'required': false, 'columnWidth': 4},
				    'NATFrontEndEndingPort': {'type': 'num', 'required': false, 'columnWidth': 4},
				    'NATBackEndPort': {'type': 'num', 'required': false, 'columnWidth': 4}},
		     'cospecifications': [['roundRobinFrontEndPort', 'roundRobinBackEndPort', 'roundRobinProbePort'],
					  ['NATFrontEndStartingPort', 'NATFrontEndEndingPort', 'NATBackEndPort']]},
	      
	      'SA': {'plural': 'SAs',
		     'populatableSelectors': {},
		     'blocks': {},
		     'properties': {'storageType': {'type': 'storageType', 'required': true, 'columnWidth': 12}},
		     'cospecifications': []},
	      
	      'VM': {'plural': 'VMs',
		     'populatableSelectors': {'NIC': true, 'SA': true},
		     'blocks': {},
		     'properties': {'vmSize': {'type': 'vmSize', 'required': true, 'columnWidth': 6},
				    'os': {'type': 'os', 'required': true, 'columnWidth': 6},
				    'adminUsername': {'type': 'text', 'required': true, 'columnWidth': 6},
				    'adminPassword': {'type': 'password', 'required': true, 'columnWidth': 6},
				    'NIC': {'type': 'dropdown', 'required': true, 'columnWidth': 4},
				    'SA': {'type': 'dropdown', 'required': true, 'columnWidth': 4},
				    'bootDiagnostics': {'type': 'checkbox', 'required': true, 'columnWidth': 4}},
		     'cospecifications': []},
	      
	      'VMSS': {'plural': 'VMSSes',
		       'populatableSelectors': {'VNET': true, 'LB': true, 'SA': true},
		       'blocks': {},
		       'properties': {'capacity': {'type': 'num', 'required': true, 'columnWidth': 4},
				      'vmSize': {'type': 'vmSize', 'required': true, 'columnWidth': 4},
				      'os': {'type': 'os', 'required': true, 'columnWidth': 4},
				      'adminUsername': {'type': 'text', 'required': true, 'columnWidth': 6},
				      'adminPassword': {'type': 'password', 'required': true, 'columnWidth': 6},
				      'VNET': {'type': 'dropdown', 'required': true, 'columnWidth': 4},
				      'LB': {'type': 'dropdown', 'required': false, 'columnWidth': 4},
				      'SA': {'type': 'dropdown', 'required': true, 'columnWidth': 4}},
		       'cospecifications': []}};

function getView(details, referenceId) {
    switch(details['type']) {
    case 'text':
	return "<input id='" + referenceId + "'></input>"

    case 'num':
	return "<input id='" + referenceId + "' type='number'></input>";

    case 'password':
	return "<input id='" + referenceId + "' type='password'></input>";

    case 'dropdown':
	ret = "<select id='" + referenceId + "'><option value='generateForMe'>generateForMe</option>";

	if (!(details['required'])) {
	    ret += "<option value='none'>none</option>";
	}
	
	ret += "</select>";

	return ret;

    case 'storageType':
	return "<select id='" + referenceId + "'>" +
	    "<option value='Standard_LRS'>Standard_LRS</option>" +
	    "<option value='Standard_GRS'>Standard_GRS</option>" +
	    "<option value='Standard_RAGRS'>Standard_RAGRS</option>" +
	    "<option value='Premium_LRS'>Premium_LRS</option>" +
	    "</select>";

    case 'vmSize':
	return "<select id='" + referenceId + "'>" +
	    "<option value='Standard_A1'>Standard_A1</option>" +
	    "<option value='Standard_A2'>Standard_A2</option>" +
	    "<option value='Standard_A3'>Standard_A3</option>" +
	    "<option value='Standard_A4'>Standard_A4</option>" +
	    "<option value='Standard_D1'>Standard_D1</option>" +
	    "<option value='Standard_D2'>Standard_D2</option>" +
	    "<option value='Standard_D3'>Standard_D3</option>" +
	    "<option value='Standard_D4'>Standard_D4</option>" +
	    "</select>";

    case 'os':
	return "<select id='" + referenceId + "'>" +
	    "<option value='Linux'>Linux</option>" +
	    "<option value='Windows'>Windows</option>" +
	    "</select>";

    case 'checkbox':
	return "<input type='checkbox' id='" + referenceId + "'></input>";


	    
    default:
	console.log('invalid view type ' + viewType + ' with referenceId ' + referenceId);
    }
}

var properRowWidth = 12;

$(document).ready(drawCurrent);

function commitsDivHtml(blockType) {
    var ret =
	'<div id="commits">' +
	'  <button class="btn btn-default" onclick="javascript:addBlock(\'' + blockType + '\')">Add</button>' +
	'  <button class="btn btn-default" onclick="javascript:nixBlock()">Cancel</button>' +
	'</div>';

    return ret;
}

function populateDetails(blockType) {
    var detailsHtml = "<hr/><div class='subtitle'>" + "NEW " + blockType + "</div><br/><br/>";

    var blockHtml =
	"<div class='row'>" +
	"  <div class='col-md-6'>" + 
	"    naming infix (distinguishes " + blocks[blockType]['plural'] + "): <input id='namingInfix'></input>" +
	"  </div> " +
	"  <div class='col-md-6'>" + 
	"    number of  " + blocks[blockType]['plural'] + ": <input id='num'></input>" +
	"  </div> " +
	"</div>";

    var currentWidthUsed = 0;
    for (var property in blocks[blockType]['properties']) {
	if (currentWidthUsed == 0) {
	    blockHtml += "<br/>";
	    blockHtml += "<div class='row'>";
	}

	blockHtml += "<div class='col-md-" + blocks[blockType]['properties'][property]['columnWidth'].toString() + "'>" +
	    property + ": " + getView(blocks[blockType]['properties'][property], property) + "</div>";

	currentWidthUsed += blocks[blockType]['properties'][property]['columnWidth'];

	if (currentWidthUsed == properRowWidth) {
	    blockHtml += "</div>";
	    currentWidthUsed = 0;

	} else if (currentWidthUsed > properRowWidth) {
	    console.log("row width (" + currentWidthUsed.toString() + ") for for blockType " + blockType + " was over max of " + properRowWidth.toString());
	}
    }

    detailsHtml += blockHtml + "<br/><br/>" + commitsDivHtml(blockType) + "<hr/>";

    $('#details').html(detailsHtml);

    populateSelectors(blockType);
}

function getBlockName(blockType, blockName) {
    if (!(blockType in blocks)) {
	console.log('ERROR: invalid block type: ' + blockType);
	return;
    }

    if (blockName == "") {
	return blockType;
    }

    return blockType + '-' + blockName;
}

function populateSelectors(blockType) {
    if (!(blockType in blocks)) {
	console.log('ERROR: invalid block type: ' + blockType);
	return;
    }
    
    for (populatableSelector in blocks[blockType]['populatableSelectors']) {
	for (blockName in blocks[populatableSelector]['blocks']) {
	    value = getBlockName(populatableSelector, blockName)
	    option = "<option value='" + value + "'>" +
		value + "</option>";
	    $('#' + populatableSelector).append(option);
	}
    }
}

function numValidity(n, property) {
    if (isNaN(n)) {
	return false;
    }
    
    if (n < 1) {
	return false;
    }

    return true;
}

function stringSpecified(property, proposedBlock) {
    if (!(property in proposedBlock)) {
	return false;
    }
    
    if (proposedBlock[property] === undefined) {
	return false;
    }
    
    if (proposedBlock[property] === "") {
	return false;
    }

    return true;
}

function specified(property, blockType, proposedBlock) {
    if (!stringSpecified(property, proposedBlock)) {
	return false;
    }

    if (blocks[blockType]['properties'][property]['type'] == 'num') {
	if (!numValidity(proposedBlock[property], property)) {
	    return false;
	}
    }

    return true;
}

function allSpecified(propertyList, blockType, proposedBlock) {
    var specifieds = propertyList.map(function(property) {
	return specified(property, blockType, proposedBlock);
    });
    
    return specifieds.reduce(function(prev, cur, index, arr) {
	return prev && cur;
    });
}

function validateBlock(blockType, proposedBlock) {
    for (var property in blocks[blockType]['properties']) {
	if (blocks[blockType]['properties'][property]['required']) {
	    if (!specified(property, blockType, proposedBlock)) {
		alert("please specify a proper value for property " + property);
		return false;
	    }
	}
    }
    
    // if cospecifications array is empty, default to true
    var atLeastOneGroupSatisfied = true;

    var satisfiedGroups = blocks[blockType]['cospecifications'].map(function(propertyList) {
	return allSpecified(propertyList, blockType, proposedBlock);
    });

    atLeastOneGroupSatisfied = satisfiedGroups.reduce(function(prev, cur, index, arr) {
	return prev || cur;
    });

    if (!atLeastOneGroupSatisfied) {
	groupsString = "";
	for (var index in blocks[blockType]['cospecifications']) {
	    groupsString += "[" + blocks[blockType]['cospecifications'][index].toString() + "], "
	}

	// -2 to remove excess ", " at the end
	alert("Must specifiy all of the members of at least one of the following groups: " +
	      groupsString.substring(0, groupsString.length-2));
    }

    return atLeastOneGroupSatisfied;
}

function addBlock(blockType) {
    if (!(blockType in blocks)) {
	console.log('ERROR: invalid block type: ' + blockType);
	return;
    }

    var infix = $('#namingInfix').val();
    if (infix in blocks[blockType]['blocks']) {
	alert('There is already a ' + blockType + ' with infix "' + infix + '"! please choose a different infix, or edit/delete the other ' + blockType + '.');
	return;
    }

    var numCopy = parseInt($('#num').val());
    if (!numValidity(numCopy, 'number of ' + blocks[blockType]['plural'])) {
	return;
    }

    var newBlock = {}
    for (var property in blocks[blockType]['properties']) {
	var val = null;
	if (blocks[blockType]['properties'][property]['type'] == 'checkbox') {
	    val = $('#' + property).is(":checked");
	} else if (blocks[blockType]['properties'][property]['type'] == 'num'){
	    val = parseInt($('#' + property).val());
	} else {
	    val = $('#' + property).val();
	}

	newBlock[property] = val;
    }

    if (!validateBlock(blockType, newBlock)) {
	return;
    }

    newBlock['numCopy'] = numCopy;

    blocks[blockType]['blocks'][infix] = newBlock;

    return;

    switch (which) {
    case "VNET":
	vnets[infix] = {};
	break;

    case "PIP":
	domainLabel = $('#domainLabel').val();
	pips[infix] = {"domainLabel": domainLabel};
	break;

    case "NIC":
	subnet = $("#subnet").val();
	pip = $("#pip").val();
	nics[infix] = {"subnet": subnet,
		       "pip": pip};
	break;

    case "LB":
	roundRobinFrontEndPort = parseInt($("#roundRobinFrontEndPort").val());
	roundRobinBackEndPort = parseInt($("#roundRobinBackEndPort").val());
	roundRobinProbePort = parseInt($("#roundRobinProbePort").val());

	NATFrontEndStartingPort = parseInt($("#NATFrontEndStartingPort").val());
	NATFrontEndEndingPort = parseInt($("#NATFrontEndEndingPort").val());
	NATBackEndPort = parseInt($("#NATBackEndPort").val());

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
	
	if (!allNAT) {
	    alert('Some NAT rule properties are specified and others not! Please either specify all of them or none of them.');
	    break;
	}

	if (allRREmpty && allNATEmpty) {
	    alert('No rules are specified! Please specify a set of round-robin rules, a set of NAT rules, or both');
	    break;
	}
	
	lbs[infix] = {"roundRobinFrontEndPort": roundRobinFrontEndPort,
		       "roundRobinBackEndPort": roundRobinBackEndPort,
		       "roundRobinProbePort": roundRobinProbePort,
		       "NATFrontEndStartingPort": NATFrontEndStartingPort,
		       "NATFrontEndEndingPort": NATFrontEndEndingPort,
		       "NATBackEndPort": NATBackEndPort};
	break;

    case "SA":
	type = $('#type').val();
	num = parseInt($('#numsas').val());

	if (isNaN(num)) {
	    alert('The number of SAs is invalid!');
	    break;
	}

	if (num < 1) {
	    alert('The number of SAs is invalid!');
	    break;
	}

	sas[infix] = {"type": type,
		      "num": num};
	break;

    case "VM":
	num = parseInt($('#numVMs').val());
	size = $('#size').val();
	os = $('#OS').val();
	username = $('#username').val();
	password = $('#password').val();
	nic = $('#nic').val();
	sa = $('#sa').val();
	bd = $('#bootDiagnostics').is(":checked");

	if (isNaN(num)) {
	    alert('The number of VMs is invalid!');
	    break;
	}

	if (num < 1) {
	    alert('The number of VMs is invalid!');
	    break;
	}

	if (username == "") {
	    alert("admin username can't be empty!");
	    break;
	}

	if (password == "") {
	    alert("admin password can't be empty!");
	    break;
	}

	vms[infix] = {"num": num,
		      "size": size,
		      "os": os,
		      "username": username,
		      "password": password,
		      "nic": nic,
		      "sa": sa,
		      "bd": bd};
	break;

    case "VMSS":
	numVMSS = parseInt($('#numVMSS').val());
	target = parseInt($('#targetInstanceCount').val());
	size = $('#size').val();
	os = $('#OS').val();
	username = $('#username').val();
	password = $('#password').val();
	subnet = $('#subnet').val();
	lb = $('#lb').val();
	vmssSAs = $('#sas').val();

	if (isNaN(numVMSS)) {
	    alert('The number of VMSSes is invalid!');
	    break;
	}

	if (isNaN(target)) {
	    alert('The target instance count per VMSS is invalid!');
	    break;
	}

	if (numVMSS < 1) {
	    alert('The number of VMSSes is invalid!');
	    break;
	}

	if (target < 1) {
	    alert('The target instance count per VMSS is invalid!');
	    break;
	}

	if (username == "") {
	    alert("admin username can't be empty!");
	    break;
	}

	if (password == "") {
	    alert("admin password can't be empty!");
	    break;
	}

	vmsses[infix] = {"numVMSS": numVMSS,
		      "target": target,
		      "size": size,
		      "os": os,
		      "username": username,
		      "password": password,
		      "subnet": subnet,
		      "lb": lb,
		      "sas": vmssSAs};
	break;
    }

    drawCurrent();
}

function nixBlock() {
    $('#details').html("");
}

function drawCurrent() {
    var currentString = "";
    for (blockType in blocks) {
	currentString += "&nbsp;&nbsp;<span class='subtitle'>" + blockType['plural'] + ":</span>&nbsp;&nbsp;&nbsp;";
	for (blockName in blocks[blockType]['blocks']) {
	    currentString += getBlockName(blockType, blockName) + "&nbsp;&nbsp;&nbsp;";
	}

	currentString += "<br/>";
    }
    
    $("#current").html(currentString);
}
