function populateDetails(which) {
    switch (which) {
    case "VNET":
	$('#details').html('VNET');
	break;

    case "PIP":
	$('#details').html('PIP');
	break;

    case "LB":
	$('#details').html('LB');
	break;

    case "VM":
	$('#details').html('VM');
	break;

    case "VMSS":
	$('#details').html('VMSS');
	break;
    }
}