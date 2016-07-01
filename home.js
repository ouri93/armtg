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

  'properties[property][type]': 'num', 'dropdown', 'text', 'potentiallyEmptyText', 'vmSize', 'storageAccountType', 'os', 'password', or 'checkbox'; determines the html element (view) that receives the user input, as well as the validation of this property (controller)

  'properties::required': true if required, false if not

  'properties::columnWidth': width of the column for that property; a single row has width of 12 (really belongs in a view of some sort but is convenient to have here); EACH ROW MUST ADD UP TO 12; THE VIEW-GENERATION CODE ASSUMES THIS; IF THE LAST ROW DOES NOT ADD UP TO 12, THE CLOSING </div> WON'T BE ADDED

  'cospecifications': a list of lists; adds validation that at least one of the sublists has all of its entries specified
  
  'baseObject': the base JSON object used to create the block of that type; if this is missing, the button to add this object to the template won't appear

  'customization': a function for customizing a block based on user input; takes in a base block populated by baseObject and the block infix; returns the customized block

  Misc
  ----
  Subnets are treated as "first-class blocks", making the code below easier, with some consequences. For instance, users must specify subnets separately from vnets. Additionally, there is some special-case code to embed subnets within vnets when generating the template.
*/

// apiVersion, location, name
var blocks = {
    // properties::subnets, //properties::addressSpace::addressPrefixes
    'vnet': {'plural': 'VNETs',
	     'populatableSelectors': {},
	     'blocks': {},
	     'properties': {'addressPrefix': {'type': 'addressPrefix', 'required': true, 'columnWidth': 12}},
	     'cospecifications': [],
	     'baseObject': {
		 "type": "Microsoft.Network/virtualNetworks",
		 "properties": {
		     "addressSpace": {
			 "addressPrefixes": []
		     },
		     "subnets": []
		 }
	     },
	     'customization': function(block, blockInfix) {
		 // add addressPrefix to this vnet
		 block["properties"]["addressSpace"]["addressPrefixes"].push(blocks["vnet"]["blocks"][blockInfix]["addressPrefix"]);

		 // add subnets to this vnet
		 for (var subnetInfix in blocks["subnet"]["blocks"]) {
		     if (getInfixFromBlockName(blocks["subnet"]["blocks"][subnetInfix]["vnet"]) == blockInfix) {
			 var subnetBlock = createSubBlock("subnet", subnetInfix);
			 subnetBlock["properties"] = {"addressPrefix": blocks["subnet"]["blocks"][subnetInfix]["addressPrefix"]};
			 block["properties"]["subnets"].push(subnetBlock);
		     }
		 }

		 return block;
	     }
	    },

    // properties::addressPrefix
    'subnet': {'plural': 'SUBNETs',
	       'populatableSelectors': {'vnet': true},
	       'blocks': {},
	       'properties': {'vnet': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
			      'addressPrefix': {'type': 'smallAddressPrefix', 'required': true, 'columnWidth': 6}},
	       'cospecifications': [],
	       'baseObject': {
		   "properties": {
		   }
	       },
	       'customization': function(block, blockInfix) {
		   // don't actually want subnets as their own top-level resource, so return null
		   // subnets are dealt with in the 'customization' section of vnets
		   return null;
	       }
	      },


    // properties::dnsSettings::domainNameLabel
    'pip': {'plural': 'PIPs',
	    'populatableSelectors': {},
	    'blocks': {},
	    'properties': {'domainNameLabel': {'type': 'potentiallyEmptyText', 'required': false, 'columnWidth': 12}},
	    'cospecifications': [],
	    'baseObject': {
		"type": "Microsoft.Network/publicIPAddresses",
		"properties": {
		    "publicIPAllocationMethod": "Dynamic"
		}
	    },
	    'customization': function(block, blockInfix) {
		if (blocks["pip"]["blocks"][blockInfix]["domainNameLabel"] != "") {
		    block["properties"]["dnsSettings"] = {"domainNameLabel": blocks["pip"]["blocks"][blockInfix]["domainNameLabel"]};
		}

		return block;
	    }
	   },
    
    // dependsOn vnet and optional pip; ipconfigurations::name; ipConfigurations::properties::subnet::id
    'nic': {'plural': 'NICs',
	    'populatableSelectors': {'subnet': true, 'pip': true},
	    'blocks': {},
	    'properties': {'subnet': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
			   'pip': {'type': 'dropdown', 'required': false, 'columnWidth': 6}},
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
		block["properties"]["ipConfigurations"][0]["name"] = getBlockNamingInfix(getBlockName("nic", blockInfix)) + ", 'ipconfig')]";
		if (blocks["nic"]["blocks"][blockInfix]["pip"] != "none") {
		    block["dependsOn"].push("[concat('Microsoft.Network/publicIPAddresses/', " + getPartialNamingInfix(blocks["nic"]["blocks"][blockInfix]["pip"]) + ")]");
		    block["properties"]["ipConfigurations"][0]["properties"]["publicIPAddress"] = {"id": "[resourceId('Microsoft.Network/publicIPAddresses', " + getPartialTemplateName(blocks["nic"]["blocks"][blockInfix]["pip"]) + ")]"};
		}
		
		subnet = blocks["nic"]["blocks"][blockInfix]["subnet"];
		subnetInfix = getInfixFromBlockName(subnet);

		vnet = blocks["subnet"]["blocks"][subnetInfix]["vnet"];
		vnetInfix = getInfixFromBlockName(vnet);
		
		block["dependsOn"].push("[concat('Microsoft.Network/virtualNetworks/', " + getPartialNamingInfix(vnet) + ")]");
		block["properties"]["ipConfigurations"][0]["properties"]["subnet"] = {"id": "[concat(resourceId('Microsoft.Network/virtualNetworks', " + getPartialTemplateName(vnet) + "), '/subnets/', " + getPartialNamingInfix(subnet) + ")]"};
		
		return block;
	    }
	   },

    /*
    // depends on optional vnet and optional pip; properties::frontEndIPConfigurations::0::name, properties::frontEndIPConfigurations::0::properties::subnet::id (ref), properties::backendAddressPools::0::name, optional LB rules, optional NAT rules, properties::probes::properties::port, properties::probes::properties::name
    'LB': {'plural': 'LBs',
	   'populatableSelectors': {'SUBNET': true, 'PIP': true},
	   'blocks': {},
	   'properties': {'SUBNET': {'type': 'dropdown', 'required': false, 'columnWidth': 6},
			  'PIP': {'type': 'dropdown', 'required': false, 'columnWidth': 6},
			  'roundRobinFrontEndPort': {'type': 'num', 'required': false, 'columnWidth': 4},
			  'roundRobinBackEndPort': {'type': 'num', 'required': false, 'columnWidth': 4},
			  'roundRobinProbePort': {'type': 'num', 'required': false, 'columnWidth': 4},
			  'NATFrontEndStartingPort': {'type': 'num', 'required': false, 'columnWidth': 4},
			  'NATFrontEndEndingPort': {'type': 'num', 'required': false, 'columnWidth': 4},
			  'NATBackEndPort': {'type': 'num', 'required': false, 'columnWidth': 4}},
	   'cospecifications': [['roundRobinFrontEndPort', 'roundRobinBackEndPort', 'roundRobinProbePort'],
				['NATFrontEndStartingPort', 'NATFrontEndEndingPort', 'NATBackEndPort']],
	   'baseObject': {
	       "type": "Microsoft.Network/loadBalancers",
	       "properties": {
		   "frontendIPConfigurations": [{}],
		   "backendAddressPools": [{}],
		   "probes": [
		       {
			   "properties": {
			       "protocol": "Tcp",
			       "intervalInSeconds": 15,
			       "numberOfProbes": 2
			   }
		       }
		   ]
	       }},
    */
    
    'sa': {'plural': 'SAs',
	   'populatableSelectors': {},
	   'blocks': {},
	   'properties': {'accountType': {'type': 'storageAccountType', 'required': true, 'columnWidth': 12}},
	   'cospecifications': [],
	   'baseObject': {
	       "type": "Microsoft.Storage/storageAccounts",
	       "properties": {
		   "accountType": "Standard_LRS"
	       }
	   },
	   'customization': function(block, blockInfix) {
	       partialBlockName = getPartialTemplateName(getBlockName("sa", blockInfix));
	       block["name"] = "[concat(uniqueString(concat(resourceGroup().id, toLower(" + partialBlockName + "))), toLower(" + partialBlockName + "))]";
	       block["properties"]["accountType"] = blocks["sa"]["blocks"][blockInfix]["accountType"];
	       return block;
	   }},
    
    'vm': {'plural': 'VMs',
	   'populatableSelectors': {'nic': true, 'sa': true},
	   'blocks': {},
	   'properties': {'vmSize': {'type': 'vmSize', 'required': true, 'columnWidth': 6},
			  'os': {'type': 'os', 'required': true, 'columnWidth': 6},
			  'adminUsername': {'type': 'text', 'required': true, 'columnWidth': 6},
			  'adminPassword': {'type': 'password', 'required': true, 'columnWidth': 6},
			  'nic': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
			  'sa': {'type': 'dropdown', 'required': true, 'columnWidth': 6},
			  /*'bootDiagnostics': {'type': 'checkbox', 'required': true, 'columnWidth': 4}*/},
	   'cospecifications': [],
	   // properties::networkProfile::networkInterfaces::0::id, dependsOn SA and NIC, properties::hardwareProfile::vmSize, osProfile::computerName/adminUsername/adminPassword, properties::storageProfile::imageReference, properties::storageProfile::osDisk::name/vhd
	   'baseObject': {
	       "type": "Microsoft.Compute/virtualMachines",
	       "dependsOn": [],
	       "properties": {
		   "hardwareProfile": {},
		   "osProfile": {},
		   "storageProfile": {
		       "imageReference": {},
		       "osDisk": {
			   "vhd": {},
			   "caching": "ReadWrite",
			   "createOption": "FromImage"
		       }
		   },
		   "networkProfile": {
		       "networkInterfaces": [{}]
		   }
	       }
	   }
	  }

    /*,
    
    'VMSS': {'plural': 'VMSSes',
	     'populatableSelectors': {'SUBNET': true, 'LB': true, 'SA': true},
	     'blocks': {},
	     'properties': {'capacity': {'type': 'num', 'required': true, 'columnWidth': 4},
			    'vmSize': {'type': 'vmSize', 'required': true, 'columnWidth': 4},
			    'os': {'type': 'os', 'required': true, 'columnWidth': 4},
			    'adminUsername': {'type': 'text', 'required': true, 'columnWidth': 6},
			    'adminPassword': {'type': 'password', 'required': true, 'columnWidth': 6},
			    'SUBNET': {'type': 'dropdown', 'required': true, 'columnWidth': 4},
			    'LB': {'type': 'dropdown', 'required': false, 'columnWidth': 4},
			    'SA': {'type': 'dropdown', 'required': true, 'columnWidth': 4}},
	     'cospecifications': []}

    */

};

var blocksCopy = null;

function initializeBlocks() {
    blocksCopy = jQuery.extend(true, {}, blocks);

    // add common properties to all block types
    for (var blockType in blocks) {
	blocks[blockType]['properties']['namingInfix'] = {'type': 'potentiallyEmptyText', 'required': false, 'columnWidth': 12};
	//blocks[blockType]['properties']['numCopies'] = {'type': 'num', 'required': true, 'columnWidth': 6};
    }
}





var types = {
    'text': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "'></input>";
	},
	'isValid': function(input) {
            if (input === "") {
		return false;
	    }

	    return true;
	}
    },

    'potentiallyEmptyText': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "'></input>";
	},
	'isValid': function(input) {
	    return true;
	}
    },
    
    'num': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "' type='number'></input>";
	},
	'isValid': function(input) {
	    if (isNaN(input)) {
		return false;
	    }
	    
	    if (input < 1) {
		return false;
	    }
	    
	    return true;
	}
    },
    
    'password': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "' type='password'></input>";
	},
	'isValid': function(input) {
	    return true;
	}
    },
    
    'dropdown': {
	'getView': function(details, referenceId) {
	    var ret = "<select id='" + referenceId + "'>";
	    
	    if (!(details['required'])) {
		ret += "<option value='none'>none</option>";
	    }
	    
	    ret += "</select>";
	    
	    return ret;
	},
	'isValid': function(input) {
	    return true;
	}
    },
    
    'storageAccountType': {
	'getView': function(details, referenceId) {
	    return "<select id='" + referenceId + "'>" +
		"<option value='Standard_LRS'>Standard_LRS</option>" +
		"<option value='Standard_GRS'>Standard_GRS</option>" +
		"<option value='Standard_RAGRS'>Standard_RAGRS</option>" +
		"<option value='Standard_RAGRS'>Standard_ZRS</option>" +
		"<option value='Premium_LRS'>Premium_LRS</option>" +
		"</select>";
	},
	'isValid': function(input) {
	    return true;
	}
    },
    
    'vmSize': {
	'getView': function(details, referenceId) {
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
	},
	'isValid': function(input) {
	    return true;
	}
    },

    'os': {
	'getView': function(details, referenceId) {
	    return "<select id='" + referenceId + "'>" +
		"<option value='Linux'>Linux</option>" +
		"<option value='Windows'>Windows</option>" +
		"</select>";
	},
	'isValid': function(input) {
	    return true;
	}
    },
    
    'checkbox': {
	'getView': function(details, referenceId) {
	    return "<input type='checkbox' id='" + referenceId + "'></input>";
	},
	'isValid': function(input) {
	    return true;
	}
    },

    'addressPrefix': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "' value='10.0.0.0/16'></input>";
	},
	'isValid': function(input) {
            if (input === "") {
		return false;
	    }

	    // re tests if we get a start-line, a dotted-quad of numbers,
	    // then a '/', then another number, then the end-line,
	    // capturing the numbers for later use;
	    // re doesn't check that the numbers are the proper size
	    var re = new RegExp("^(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)/(\\d+)$");
	    res = re.exec(input);
	    
	    if (res === null) {
		return false;
	    }

	    // now check that the numbers are the proper size;
	    // start at i=1 because this is where the remembered values start;
	    // 0 is the full string;
	    var n = 0;
	    for (var i = 1; i <= 5; i++) {
		n = parseInt(res[i]);
		if (isNaN(n)) {
		    return false;
		}

		if (n < 0 || n > 255) {
		    return false;
		}
	    }

	    return true;
	}
    },

    'smallAddressPrefix': {
	'getView': function(details, referenceId) {
	    return "<input id='" + referenceId + "' value='10.0.0.0/24'></input>";
	},
	'isValid': function(input) {
	    return types['addressPrefix'].isValid(input);
	}
    }
};



////////////////////
// UI (View) Code //
////////////////////

var properRowWidth = 12;
var controlButtonWidth = 3;
var numControlButtonsPerRow = properRowWidth / controlButtonWidth;

$(document).ready(function() {
    initializeBlocks();

    var controlHtml = "";
    var currentWidthUsed = 0;
    numBlockTypes = 0;
    for (var blockType in blocks) {
	if (!('baseObject' in blocks[blockType])) {
	    continue;
	}

	numBlockTypes += 1;

	if (currentWidthUsed == 0) {
	    controlHtml += "<br/>"
	    controlHtml += "<div class='row'>";
	}

	controlHtml += "<div class='col-md-" + controlButtonWidth.toString() + "'><button id='" + blockType + "' class='btn btn-default' onclick='javascript:populateDetails(\"" + blockType + "\");'>+ " + blockType + "</button></div>";

	currentWidthUsed += controlButtonWidth;

	if (currentWidthUsed == properRowWidth) {
	    controlHtml += "</div>";
	    currentWidthUsed = 0;

	} else if (currentWidthUsed > properRowWidth) {
	    console.log("CONTROL BUTTONS: row width (" + currentWidthUsed.toString() + ") for for blockType " + blockType + " was over max of " + properRowWidth.toString());
	}
    }

    // close last row if necessary
    if ((numBlockTypes % numControlButtonsPerRow) != 0) {
	controlHtml += "</div>";
    }

    $("#control").html(controlHtml);

    drawCurrent();
});

function commitsDivHtml(blockType) {
    var ret =
	'<div id="commits">' +
	'  <button id="addBlockButton" class="btn btn-default" onclick="javascript:addBlock(\'' + blockType + '\')">Add</button>' +
	'  <button id="nixBlockButton" class="btn btn-default" onclick="javascript:nixBlock()">Cancel</button>' +
	'</div>';

    return ret;
}

function populateDetails(blockType) {
    var detailsHtml = "<hr/><div class='subtitle'>" + "new " + blockType + "</div><br/><br/>";

    var blockHtml = "";
    var currentWidthUsed = 0;
    for (var property in blocks[blockType]['properties']) {
	if (currentWidthUsed == 0) {
	    blockHtml += "<br/>";
	    blockHtml += "<div class='row'>";
	}

	var requiredString = blocks[blockType]['properties'][property]['required'] ? "*" : "";

	blockHtml += "<div class='col-md-" + blocks[blockType]['properties'][property]['columnWidth'].toString() + "'>" +
	    property + requiredString + ": " + types[blocks[blockType]['properties'][property]['type']].getView(blocks[blockType]['properties'][property], property) + "</div>";

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

    return blockType + blockName;
}


function getInfixFromBlockName(blockName) {
    var index = -1;
    for (var blockType in blocks) {
	typeLen = blockType.length;
	relevantPart = blockName.slice(0, typeLen);
	if (blockType == relevantPart) {
	    return blockName.slice(typeLen);
	}
    }

    console.log('ERROR: could not getInfixFromBlockName(' + blockName + ')');

    return;
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


function specified(property, proposedBlock) {
    if (!(property in proposedBlock)) {
	return false;
    }
    
    if (proposedBlock[property] == undefined) {
	return false;
    }

    return true;
}

function allSpecified(propertyList, proposedBlock) {
    var specifieds = propertyList.map(function(property) {
	return specified(property, proposedBlock);
    });
    
    return specifieds.reduce(function(prev, cur, index, arr) {
	return prev && cur;
    }, true);
}

function validateBlock(blockType, proposedBlock) {
    for (var property in blocks[blockType]['properties']) {
	var spec = specified(property, proposedBlock);
	if (blocks[blockType]['properties'][property]['required']) {
	    if (!spec) {
		alert("please specify a value for " + property + "!");
		return false;
	    }
	}

	if (spec) {
	    if (!(types[blocks[blockType]['properties'][property]['type']].isValid(proposedBlock[property]))) {
		alert(property + " is invalid!");
		return false;
	    }
	}
    }
    
    if (blocks[blockType]['cospecifications'].length > 0) {
	var satisfiedGroups = blocks[blockType]['cospecifications'].map(function(propertyList) {
	    return allSpecified(propertyList, proposedBlock);
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

// mostly here to re-use some block creation code for subnets,
// which are special-cased because we treat them like top-level
// blocks for convenience, but they are really subBlocks
function createSubBlock(blockType, blockInfix) {
    var deepCopy = jQuery.extend(true, {}, blocks[blockType]["baseObject"]);
    // lowercase name because storage requires it
    deepCopy['name'] = getBlockTemplateName(getBlockName(blockType, blockInfix));
    return deepCopy;
}

function createBlock(blockType, blockInfix) {
    var deepCopy = createSubBlock(blockType, blockInfix);
    deepCopy['apiVersion'] = "[variables('apiVersion')]";
    deepCopy['location'] = "[variables('location')]";

    return deepCopy;
}

function sortKeys(obj) {
    keys = Object.keys(obj);
    keys.sort();
    ret = {};
    for (var keyIndex in keys) {
	ret[keys[keyIndex]] = obj[keys[keyIndex]];
    }

    return ret;
}

function createResources(templateObject) {
    for (var blockType in blocks) {
	for (var blockInfix in blocks[blockType]["blocks"]) {
	    var curBlock = createBlock(blockType, blockInfix);
	    var finalForm = blocks[blockType].customization(curBlock, blockInfix);
	    if (finalForm != null) {
		var sortedFinalForm = sortKeys(finalForm);
		templateObject["resources"].push(sortedFinalForm);
	    }
	}
    }
}

function generateTemplate() {
    var freshCopy = jQuery.extend(true, {}, baseTemplateObject);
    createResources(freshCopy);
    $('#output').html("<pre>" + JSON.stringify(freshCopy, null, 2) + "</pre>");
}

function restartTemplate() {
    var freshCopy = jQuery.extend(true, {}, blocksCopy);
    blocks = freshCopy;
    initializeBlocks();
    drawCurrent();
    $('#output').html("");
}

function deployToAzure() {
    alert("TODO!");
}
