variables = {};
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
    detailsHtml = "<hr/>";

    switch (which) {
    case "VAR":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>Variable Name: <input id='varName'></input>" +
	    "  </div>" +
	    "  <div class='col-md-6'>Variable Type: " +
	    "    <select id='varType'>" +
	    "      <option value='string'>string</option>" +
	    "      <option value='securestring'>securestring</option>" +
	    "    </select>" +
	    "  </div>" +
	    "</div>";
	break;

    case "PAR":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-4'>Parameter Name: <input id='varName'></input>" +
	    "  </div>" +
	    "  <div class='col-md-4'>Parameter Type: " +
	    "    <select>" +
	    "      <option value='string'>string</option>" +
	    "      <option value='securestring'>securestring</option>" +
	    "    </select>" +
	    "  </div>" +
	    "  <div class='col-md-4'>Parameter Metadata: <input id='parMD'>" +
	    "  </div>" +
	    "</div>";
	break;

    case "VNET":
	detailsHtml += "VNET";
	break;

    case "PIP":
	detailsHtml += "PIP";
	break;

    case "LB":
	detailsHtml += "LB";
	break;

    case "NIC":
	detailsHtml += "NIC";
	break;

    case "SA":
	detailsHtml += "SA";
	break;

    case "VM":
	detailsHtml += "VM";
	break;

    case "VMSS":
	detailsHtml += "VMSS";
	break;
    }

    detailsHtml += "<br/>" + commitsDivHtml(which) + "<hr/>";

    $('#details').html(detailsHtml);
}

function addBlock(which) {
    switch (which) {
    case "VAR":
	name = $('#varName').val();
	if (name  == "") {
	    alert("variable must have a name!");
	    break;
	}

	type = $('#varType').val();
	if (name in variables) {
	    alert("variable " + name + " already exists! Please edit or remove it below.");
	    break;
	}
	
	variables[name] = type;
	break;

    case "PAR":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-4'>Parameter Name: <input id='varName'></input>" +
	    "  </div>" +
	    "  <div class='col-md-4'>Parameter Type: " +
	    "    <select>" +
	    "      <option value='string'>string</option>" +
	    "      <option value='securestring'>securestring</option>" +
	    "    </select>" +
	    "  </div>" +
	    "  <div class='col-md-4'>Parameter Metadata: <input id='parMD'>" +
	    "  </div>" +
	    "</div>";
	break;

    case "VNET":
	detailsHtml += "VNET";
	break;

    case "PIP":
	detailsHtml += "PIP";
	break;

    case "LB":
	detailsHtml += "LB";
	break;

    case "NIC":
	detailsHtml += "NIC";
	break;

    case "SA":
	detailsHtml += "SA";
	break;

    case "VM":
	detailsHtml += "VM";
	break;

    case "VMSS":
	detailsHtml += "VMSS";
	break;
    }
}

function nixBlock() {
    alert('TODO!');
}