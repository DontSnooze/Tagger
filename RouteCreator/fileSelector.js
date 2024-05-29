var locations = []
var csvArray = []
var geocoder;

async function setupFileSelector() {
    const { Map } = await google.maps.importLibrary("maps");
    geocoder = new google.maps.Geocoder();
    var file = []
    const fileSelector = document.getElementById('file-selector')
    const resultsDiv = document.getElementById('results')
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files
        file = fileList[0]
        readCSVFile(file)
    })
}

function readCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        parseCSV(csvText)
    };
    reader.readAsText(file)
}

function parseCSV(csvText) {
    csvArray = csvStringToArray(csvText)

    for (const i in csvArray) {
        let path = csvArray[i]
        let streetA = path[0]
        let streetB = path[1]
        var streetC = path[2]

        if (streetC == "DEAD END") {
            streetC = streetB
        }

        let location1 = streetA + " & " + streetB
        let location2 = streetA + " & " + streetC

        var streets = [
            path[0],
            path[1],
            path[2]
        ]

        parseAddresses(location1, location2, streets)
    }
}

function parseAddresses(address1, address2, streets) {
    geocoder.geocode( { 'address': address1 + ',boston, ma'}, function(results, status) {
        if (status == 'OK') {
            let position = results[0].geometry.location
            getSecondPosition(address1, address2, position, streets)
        } else {
            errorLog('Geocode was not successful for the following reason: ' + status);
            errorLog('error: [' + address1 + "]")
        }
    });
}

function getSecondPosition(address1, address2, firstPosition, streets) {
    geocoder.geocode( { 'address': address2 + ',boston, ma'}, function(results, status) {
        if (status == 'OK') {
            let secondPosition = results[0].geometry.location
            locations.push([address1, address2, firstPosition, secondPosition, streets])

            if (locations.length == csvArray.length) {
                createSnippet()
            }
        } else {
            errorLog('Geocode was not successful for the following reason: ' + status);
            errorLog('error: [' + address1 + "] [" + address2 + "]")
        }
    });
}

function createSnippet() {
    const fileName = document.getElementById('file-selector-name').value
    
    var locationsObject = {}
    locationsObject.name = fileName

    var routeObjects = []

    for (const i in locations) {
        let address1 = locations[i][0]
        let address2 = locations[i][1]
        let firstPosition = locations[i][2]
        let secondPosition = locations[i][3]
        let streets = locations[i][4]

        var routeObject = {
            title: streets[0] + ", " + streets[1] + " to " + streets[2],
            coords: [
                firstPosition,
                secondPosition
            ]
        }
        routeObjects.push(routeObject)
    }

    locationsObject.route = routeObjects

    let resultsDiv = document.getElementById("results")
    resultsDiv.textContent = JSON.stringify(locationsObject, undefined, 2);    
}

function csvStringToArray(strData) {
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"),"gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)){
        if (arrMatches[1].length && arrMatches[1] !== ",")arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ? 
            arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"") :
            arrMatches[3]);
    }
    return arrData;
}

function errorLog(error) {
    const errorConsole = document.getElementById('error-console')
    errorConsole.innerHTML += error + "<br>"
}

setupFileSelector()