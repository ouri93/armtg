////////////////////////
// Object Model Code //
///////////////////////

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

  'customizations': a function for customizing a block based on user input; takes in a base block populated by baseObject and the block infix; returns the customized block
*/

// apiVersion, location, name
var blocks = {
    // properties::subnets::name
    'VNET': {'plural': 'VNETs',
	     'populatableSelectors': {},
	     'blocks': {},
	     'properties': {},
	     'cospecifications': [],
	     'baseObject': {
		 "type": "Microsoft.Network/virtualNetworks",
		 "properties": {
		     "addressSpace": {
			 "addressPrefixes": [
			     "10.0.0.0/16"
			 ]
		     },
		     "subnets": [
			 {
			     "properties": {
				 "addressPrefix": "10.0.0.0/24"
			     }
			 }
		     ]
		 }
	     },
	     'customization': function(block, blockInfix) {
		 block['properties']['subnets']['name'] = getBlockNamingInfix(getBlockName("VNET", blockInfix)) + ", 'subnet')]";
		 return block;
	     }
	    },

    // properties::dnsSettings::domainNameLabel
    'PIP': {'plural': 'PIPs',
	    'populatableSelectors': {},
	    'blocks': {},
	    'properties': {'domainNameLabel': {'type': 'text', 'required': false, 'columnWidth': 12}},
	    'cospecifications': [],
	    'baseObject': {
		"type": "Microsoft.Network/publicIPAddresses",
		"properties": {
		    "publicIPAllocationMethod": "Dynamic"
		}
	    },
	    'customization': function(block, blockInfix) {
		if (blocks["PIP"]["blocks"][blockInfix]["domainNameLabel"] != "") {
		    block["properties"]["dnsSettings"] = {"domainNameLabel": blocks["PIP"]["blocks"][blockInfix]["domainNameLabel"]};
		}

		return block;
	    }
	   },
    
    // dependsOn vnet and optional pip; ipconfigurations::name; ipConfigurations::properties::subnet::id
    'NIC': {'plural': 'NICs',
	    'populatableSelectors': {'VNET': true, 'PIP': true},
	    'blocks': {},
	    'properties': {'VNET': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
			   'PIP': {'type': 'dropdown', 'required': false, 'columnWidth': 6}},
	    'cospecifications': [],
	    'baseObject': {
		"type": "Microsoft.Network/networkInterfaces",
		"dependsOn": [],
		"properties": {
		    "ipConfigurations": [
			{
			    "properties": {
				"privateIPAllocationMethod": "Dynamic"
			    }
			}
		    ]
		}
	    },
	    'customization': function(block, blockInfix) {
		block["properties"]["ipConfigurations"][0]["name"] = getBlockNamingInfix(getBlockName("NIC", blockInfix)) + ", 'ipconfig')]";
		if (blocks["NIC"]["blocks"][blockInfix]["PIP"] != "none") {
		    block["dependsOn"].push("[concat('Microsoft.Network/publicIPAddresses/', " + getPartialNamingInfix(blocks["NIC"]["blocks"][blockInfix]["PIP"]) + ")]");
		    block["properties"]["ipConfigurations"][0]["publicIPAddress"] = {"id": "[resourceId('Microsoft.Network/publicIPAddresses', " + getPartialTemplateName(blocks["NIC"]["blocks"][blockInfix]["PIP"]) + ")]"};
		}
		
		vnet = blocks["NIC"]["blocks"][blockInfix]["VNET"];
		vnetInfix = getInfixFromBlockName(vnet);
		
		block["dependsOn"].push("[concat('Microsoft.Network/virtualNetworks/', " + getPartialNamingInfix(vnet) + ")]");
		block["properties"]["ipConfigurations"][0]["subnet"] = {"id": "[concat(resourceId('Microsoft.Network/virtualNetworks', " + getPartialTemplateName(vnet) + "), '/subnets/', '" + getPartialNamingInfix(vnet) + ", 'subnet')]"};
		
		return block;
	    }
	   },
    
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

// add common properties to all block types
for (var blockType in blocks) {
    blocks[blockType]['properties']['namingInfix'] = {'type': 'text', 'required': false, 'columnWidth': 6};
    //blocks[blockType]['properties']['numCopies'] = {'type': 'num', 'required': true, 'columnWidth': 6};
}


////////////////////
// UI (View) Code //
////////////////////

function getView(details, referenceId) {
    switch(details['type']) {
    case 'text':
	return "<input id='" + referenceId + "'></input>"

    case 'num':
	return "<input id='" + referenceId + "' type='number'></input>";

    case 'password':
	return "<input id='" + referenceId + "' type='password'></input>";

    case 'dropdown':
	// !!! TODO should have generateForMe option
	//var ret = "<select id='" + referenceId + "'><option value='generateForMe'>generateForMe</option>";
	var ret = "<select id='" + referenceId + "'>";

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
	console.log('invalid view type ' + details['type'] + ' with referenceId ' + referenceId);
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

    var blockHtml = ""
    var currentWidthUsed = 0;
    for (var property in blocks[blockType]['properties']) {
	if (currentWidthUsed == 0) {
	    blockHtml += "<br/>";
	    blockHtml += "<div class='row'>";
	}

	var requiredString = blocks[blockType]['properties'][property]['required'] ? "*" : "";

	blockHtml += "<div class='col-md-" + blocks[blockType]['properties'][property]['columnWidth'].toString() + "'>" +
	    property + requiredString + ": " + getView(blocks[blockType]['properties'][property], property) + "</div>";

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


function getInfixFromBlockName(blockName) {
    index = blockName.indexOf('-');
    if (index < 0) {
	return "";
    }

    return blockName.slice(index+1);
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

function numValidity(n) {
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
    
    if (proposedBlock[property] == undefined) {
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
	if (!numValidity(proposedBlock[property])) {
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
    }, true);
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
    
    if (blocks[blockType]['cospecifications'].length > 0) {
	var satisfiedGroups = blocks[blockType]['cospecifications'].map(function(propertyList) {
	    return allSpecified(propertyList, blockType, proposedBlock);
	});
	
	var atLeastOneGroupSatisfied = satisfiedGroups.reduce(function(prev, cur, index, arr) {
	    return prev || cur;
	}, false);

	if (!atLeastOneGroupSatisfied) {
	    groupsString = "";
	    for (var index in blocks[blockType]['cospecifications']) {
		groupsString += "[" + blocks[blockType]['cospecifications'][index].toString() + "], ";
	    }
	    
	    // -2 to remove excess ", " at the end
	    alert("Must specifiy all of the members of at least one of the following groups: " +
		  groupsString.substring(0, groupsString.length-2));

	    return false;
	}
    }

    return true;
}

function addBlock(blockType) {
    if (!(blockType in blocks)) {
	console.log('ERROR: invalid block type: ' + blockType);
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

    if (newBlock['namingInfix'] in blocks[blockType]['blocks']) {
	alert('There is already a ' + blockType + ' with naming infix "' + newBlock['namingInfix'] + '"! please choose a different infix, or edit/delete the other ' + blockType + '.');
	return;
    }

    blocks[blockType]['blocks'][newBlock['namingInfix']] = newBlock;

    drawCurrent();
}

function nixBlock() {
    $('#details').html("");
}

function drawCurrent() {
    var currentString = "";
    for (blockType in blocks) {
	currentString += "&nbsp;&nbsp;<span class='subtitle'>" + blocks[blockType]['plural'] + ":</span>&nbsp;&nbsp;&nbsp;";
	for (blockName in blocks[blockType]['blocks']) {
	    currentString += getBlockName(blockType, blockName) + "&nbsp;&nbsp;&nbsp;";
	}

	currentString += "<br/>";
    }
    
    $("#current").html(currentString);
}








//////////////////////////////
// Template Generation Code //
//////////////////////////////

var baseTemplateObject = {
    "$schema":"http://schema.management.azure.com/schemas/2015-01-01-preview/deploymentTemplate.json",
    "contentVersion": "1.0.0.0",
    "parameters": {
	"namingInfix": {
	    "type": "string",
	    "maxLength": 9,
	    "metadata": {
		"description": "String used as a base for naming resources (9 characters or less). A hash is prepended to this string for some resources, and resource-specific information is appended."
	    }
	}
    },
    "variables": {
	"apiVersion": "2015-06-15",
	"location": "[resourceGroup().location]"
    },
    "resources": [],
    "outputs": {}
}

function getPartialNamingInfix(blockName) {
    return "parameters('namingInfix'), '" + blockName + "'";
}

function getPartialTemplateName(blockName) {
    return "concat(" + getPartialNamingInfix(blockName) + ")";
}

function getBlockNamingInfix(blockName) {
    return "[concat(parameters('namingInfix'), '" + blockName + "'";
}

function getBlockTemplateName(blockName) {
    return getBlockNamingInfix(blockName) + ")]";
}

function createBlock(blockType, blockInfix) {
    var deepCopy = jQuery.extend(true, {}, blocks[blockType]["baseObject"]);
    deepCopy['name'] = getBlockTemplateName(getBlockName(blockType, blockInfix));
    deepCopy['apiVersion'] = "[variables('apiVersion')]";
    deepCopy['location'] = "[variables('location')]";

    return deepCopy;
}

function createResources() {
    for (var blockType in blocks) {
	for (var blockInfix in blocks[blockType]["blocks"]) {
	    var curBlock = createBlock(blockType, blockInfix);
	    var finalForm = blocks[blockType].customization(curBlock, blockInfix);
	    baseTemplateObject["resources"].push(finalForm);
	}
    }
}

