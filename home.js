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
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (distinguishes vnets): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-6'>" + 
	    "    number of subnets: <input id='numSubnets'></input>" +
	    "  </div> " +
	    "</div>";
	break;

    case "PIP":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6'>" + 
	    "    optional naming infix (distinguishes pips): <input id='namingInfix'></input>" +
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
	    "    optional naming infix (distinguishes nics): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-6'>" + 
	    "    subnet: " +
	    "    <select id='subnet'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "</div>";
	break;

    case "LB":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-12'>" + 
	    "    optional naming infix (distinguishes lbs): <input id='namingInfix'></input>" +
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
	    "    optional naming infix (distinguishes sas): <input id='namingInfix'></input>" +
	    "  </div> " +
	    "  <div class='col-md-6'>" + 
	    "    type: " +
	    "    <select id='subnet'>" +
	    "      <option value='Standard_LRS'>Standard_LRS</option>" +
	    "      <option value='Standard_GRS'>Standard_GRS</option>" +
	    "      <option value='Standard_RAGRS'>Standard_RAGRS</option>" +
	    "      <option value='Premium_LRS'>Premium_LRS</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "</div>";
	break;

    case "VM":
	detailsHtml +=
	    "<div class='row'>" +
	    "  <div class='col-md-6,left'>" + 
	    "    optional naming infix (distinguishes vms): <input id='namingInfix'></input>" +
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
	    "  <div class='col-md-3'>" + 
	    "    OS: " +
	    "    <select id='os'>" +
	    "      <option value='Linux'>Linux</option>" +
	    "      <option value='Windows'>Windows</option>" +
	    "    </select>" + 
	    "  </div> " +
	    "</div>" +
	    "<br/>" +
	    "<div class='row'>" +
	    "  <div class='col-md-3'>" +
	    "    admin username: <input id='admin username'></input>" +
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    admin password: <input id='admin password'></input>" +
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    nic: " +
	    "    <select id='nic'>" +
	    "      <option value='generate for me'>generate for me</option>" +
	    "    </select>" + 
	    "  </div>" +
	    "  <div class='col-md-3'>" +
	    "    boot diagnostics: <input type='checkbox' id='bootDiagnostics'></input>" +
	    "  </div>" +
	    "</div>";
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

    case "NIC":
	alert('TODO!');
	break;

    case "LB":
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