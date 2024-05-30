function selectAllRoutes() {
    checkboxes = document.getElementsByName('locations');
    for(let i in checkboxes) {
        checkboxes[i].checked = true;
    }
}

function deselectAllRoutes() {
    checkboxes = document.getElementsByName('locations');
    for(let i in checkboxes) {
        checkboxes[i].checked = false;
    }
}