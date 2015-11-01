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
    case "VNET":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (should be unique per vnet): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-6'>" + 
	    "    number of subnets: <input id='numSubnets'></input>" +
	    "  </div> " +
	    "</div>";
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
    case "VNET":
	alert('TODO!');
	break;

    case "PIP":
	alert('TODO!');
	break;

    case "LB":
	alert('TODO!');
	break;

    case "NIC":
	alert('TODO!');
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
    alert('TODO!');
}