variables = {}

function populateDetails(which) {
    detailsHtml = "";

    switch (which) {
    case "VAR":
	detailsHtml =
	    "<div class='row'>" +
	    "  <div class='col-md-6'>Variable Name: <input id='varName'></input>" +
	    "  </div>" +
	    "  <div class='col-md-6'>Variable Type: " +
	    "    <select>" +
	    "      <option value='string'>string</option>" +
	    "      <option value='securestring'>securestring</option>" +
	    "    </select>" +
	    "  </div>" +
	    "</div>";
	break;

    case "PAR":
	detailsHtml = "PAR";
	break;

    case "VNET":
	detailsHtml = "VNET";
	break;

    case "PIP":
	detailsHtml = "PIP";
	break;

    case "LB":
	detailsHtml = "LB";
	break;

    case "NIC":
	detailsHtml = "NIC";
	break;

    case "SA":
	detailsHtml = "SA";
	break;

    case "VM":
	detailsHtml = "VM";
	break;

    case "VMSS":
	detailsHtml = "VMSS";
	break;
    }

    $('#details').html(detailsHtml);
}