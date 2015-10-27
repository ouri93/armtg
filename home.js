function populateDetails(which) {
    detailsHtml = "";

    switch (which) {
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