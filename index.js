var map;
var geocoder;
var shouldShowAreaHighlight = false
var shouldShowParkingMeters = false
var meterGZones = []
var parkingMeters = []

const initialPosition = { lat: 42.3507752636, lng: -71.0748797005 };
const taggerMapId = "67a3f6d5605a8cd"

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
        mapTypeControl: false,
        mapId: taggerMapId,
    });
    
    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    // initialize the goecoder
    geocoder = new google.maps.Geocoder();
    
    var colorIndex = 0
    var meterColorIndex = 0
    var gZoneColorsDict = []

    let locationsFromQuery = getLocationsFromQuery()
    getSettingsFromQuery()

    for (let i in includedLocations) {
        let locations = includedLocations[i]

        if (locationsFromQuery.length && !locationsFromQuery.includes(locations.name)) {
            continue
        }

        // add markers
        let color = colors[colorIndex]
        addMarkers(locations, color, infoWindow)

        // update the gZone array, not adding duplicates (or use a set)
        for (let i in locations.meter_g_zones) {
            let gZone = locations.meter_g_zones[i]
            if (!meterGZones.includes(gZone)) {
                meterGZones.push(gZone)
            }
        }

        colorIndex++
        if (colorIndex == colors.length) {
            colorIndex = 0
        }
    }

    // add meters if wanted
    if (shouldShowParkingMeters) {
        for (let i in parkingMeters) {
            let meter = parkingMeters[i]
            
            var gZone = meter.properties.G_ZONE
            
            if (!meterGZones.includes(gZone)) {
                continue
            }
            
            let objectId = meter.properties.OBJECTID
            let meterId = meter.properties.METER_ID
            let blkNo = meter.properties.BLK_NO
            let meterType = meter.properties.METER_TYPE
            let streetName = meter.properties.STREET
            let gPmZone = meter.properties.G_PM_ZONE
            let gDistrict = meter.properties.G_DISTRICT
            let gPassportZones = meter.properties.G_PASSPORT_ZONES
            let payPolicy = meter.properties.PAY_POLICY

            var color = ""

            // color by gZone
            if (gZone == null) {
                gZone = "null"
                gZoneColorsDict[gZone] = "Gray"
                color = "Gray"
            }

            if (gZoneColorsDict[gZone] == null) {
                meterColorIndex++

                if (meterColorIndex >= colors.length) {
                    meterColorIndex = 0
                }

                gZoneColorsDict[gZone] = colors[meterColorIndex]
            }

            color = gZoneColorsDict[gZone]

            var title = ""
            title += "[objectId: " + objectId + "]\n"
            title += "[meterId: " + meterId + "]\n"
            title += "[blkNo: " + blkNo + "]\n"
            title += "[meterType: " + meterType + "]\n"
            title += "[streetName: " + streetName + "]\n"
            title += "[gZone: " + gZone + "]\n"
            title += "[gPmZone: " + gPmZone + "]\n"
            title += "[gDistrict: " + gDistrict + "]\n"
            title += "[gPassportZones: " + gPassportZones + "]\n"
            title += "[payPolicy: " + payPolicy + "]\n"
            

            let geo = meter.geometry

            if (!geo) {
                console.log(i + ": geometry is null")
                continue
            }

            var coords = geo.coordinates

            let location = { lng: coords[0], lat: coords[1] }
            
            
            addMeter(location, title, color, infoWindow)
        }
    }

    setupSideNav()
    setupCommentsNav()
    setupGetCurrentPosition()
    monitor_position(map)
}

function setupSideNav() {
    var routeForm = document.getElementById("route-form-checkboxes")
    const locationsFromQuery = getLocationsFromQuery()

    for (let i in includedLocations) {
        let locations = includedLocations[i]
        
        var labelElement = document.createElement("label")

        var checkboxElement = document.createElement("input")
        checkboxElement.setAttribute("id", locations.name)
        checkboxElement.setAttribute("type", "checkbox")
        checkboxElement.setAttribute("value", locations.name)
        checkboxElement.setAttribute("name", "locations")
        if (locationsFromQuery.includes(locations.name) || !locationsFromQuery.length) {
            checkboxElement.setAttribute("checked", "true")
        }

        var titleDivElement = document.createElement("div")
        titleDivElement.setAttribute("class", "navCheckBoxDiv")
        titleDivElement.innerHTML += locations.name

        labelElement.appendChild(checkboxElement)
        labelElement.appendChild(titleDivElement)

        routeForm.appendChild(labelElement)
        addLineBreak(routeForm)
    }

    // Add controls to the map, allowing users to hide/show features.
    const navControl = document.getElementById("left-nav-control");

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(navControl);
}

function setupCommentsNav() {
    // Add controls to the map, allowing users to hide/show features.
    const commentsNavControl = document.getElementById("comments-nav-control");

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(commentsNavControl);
}

function addLineBreak(element) {
    linebreak = document.createElement("br");
    element.appendChild(linebreak);
}

function getLocationsFromQuery() {
    const searchParams = new URLSearchParams(window.location.search)
    var locations = searchParams.getAll("locations")

    if (!locations) {
        locations = []
    }

    return locations
}

function getSettingsFromQuery() {
    const searchParams = new URLSearchParams(window.location.search)
    const parkingMetersSettingsCheckbox = document.getElementById("settings-showParkingMeters")
    const shadeAreaSettingsCheckbox = document.getElementById("settings-showAreaShade")

    var showAreaString = searchParams.get("showAreaShade")
    var showParkingMetersString = searchParams.get("showParkingMeters")
    
    if (showParkingMetersString == "true") {
        shouldShowParkingMeters = true
        parkingMetersSettingsCheckbox.setAttribute("checked", "true")
    }
    if (showAreaString == "true") {
        shouldShowAreaHighlight = true
        shadeAreaSettingsCheckbox.setAttribute("checked", "true")
    }
}

function addMarkers(locations, color, infoWindow) {
    var colorIndex = 0
    var areaMarkers = []

    for (let i in locations.route) {
        let path = locations.route[i]

        for (let i in path.coords) {
            let position = path.coords[i]
            let title = "[" + locations.name + "] " + path.title 
            addMarker(position, title, color, infoWindow)
            areaMarkers.push(position)
        }

        drawLines(path.coords, colors[colorIndex])
        colorIndex++
        if (colorIndex == colors.length) {
            colorIndex = 0
        }
    }
    if (shouldShowAreaHighlight) {
        drawArea(areaMarkers, color, locations.name, infoWindow)
    }
}

async function addMarker(location, title, color, infoWindow) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    const pinBackground = new PinElement({
        background: color,
    });
    
    var marker = new AdvancedMarkerElement({
      position: location,
      map: map,
      title: title,
      content: pinBackground.element,
      gmpClickable: true,
    });

    marker.addListener("click", ({ domEvent, latLng }) => {
        const { target } = domEvent;
      
        infoWindow.close();
        infoWindow.setContent(marker.title);
        infoWindow.open(marker.map, marker);
    });
}

async function addMeter(location, title, color, infoWindow) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    // const icon = document.createElement('img');
    // icon.src = 'images/meter-dot-white-black.png';


    const parser = new DOMParser();

    // A marker with a custom inline SVG.

    var iconStrokeColor = "black"
    var iconStrokeColorOpacity = "0.1"

    // change this color based off time - 6pm or 8pm? or more!
    var iconFillColor = color
    var iconFillColorOpacity = "0.3"
    
    // create hollow circle svg image
    const iconSvgString = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="' + iconStrokeColor + '" stroke-width="3" stroke-opacity="' + iconStrokeColorOpacity + '" fill-opacity="' + iconFillColorOpacity + '" fill="' + iconFillColor + '" /></svg>';

    const icon = parser.parseFromString(iconSvgString, 'image/svg+xml').documentElement;

    var marker = new AdvancedMarkerElement({
      position: location,
      map: map,
      title: title,
      content: icon,
      gmpClickable: true,
      zIndex: -99999999
    });

    marker.addListener("click", ({ domEvent, latLng }) => {
        const { target } = domEvent;
      
        infoWindow.close();
        infoWindow.setContent(marker.title);
        infoWindow.open(marker.map, marker);
    });
}

function drawLines(coordinates, color) {
    var line= new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 3
    });
    
    line.setMap(map);
}

function drawArea(coordinates, color, title, infoWindow) {
    var bounds = new google.maps.LatLngBounds();
    for (let i in coordinates) {
        bounds.extend(coordinates[i]);
    }
      
      // The Center of the Bermuda Triangle - (25.3939245, -72.473816)
      let paths = polygon_paths_from_bounds(bounds)

    const areaShade = new google.maps.Polygon({
        // paths: coordinates,
        paths: paths,
        strokeColor: color,
        strokeOpacity: 0.1,
        strokeWeight: 0.5,
        fillColor: color,
        fillOpacity: 0.1,
      });
    
      areaShade.setMap(map);

      areaShade.addListener("click", ({ domEvent, latLng }) => {
        const { target } = domEvent;
        infoWindow.close();
        infoWindow.setContent(title);
        infoWindow.setPosition(bounds.getCenter())
        infoWindow.open(areaShade.map);
    });
}

var polygon_paths_from_bounds = function(bounds){
    var paths = new google.maps.MVCArray();
    var path = new google.maps.MVCArray();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    path.push(ne);
    path.push(new google.maps.LatLng(sw.lat(), ne.lng()));
    path.push(sw);
    path.push(new google.maps.LatLng(ne.lat(), sw.lng()));
    paths.push(path);
    return paths;
}

function setupGetCurrentPosition() {
    const locationButton = document.createElement("img");
    locationButton.setAttribute("class", "current-location-button")
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(locationButton);

    locationButton.addEventListener("click", () => {
        if (current_lat && current_lng) {
            const pos = { lat: current_lat, lng: current_lng }
            map.panTo(pos)
            geocodeLatLng()
        }
    })
}

var bluedot_maker = null;
var current_lat, current_lng;
const monitor_position = async (map) => {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    var geolocation_options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    };
    navigator.geolocation.watchPosition( (position) => {
        var coordinates = position.coords;
        current_lat = coordinates.latitude;
        current_lng = coordinates.longitude;
        if (bluedot_maker == null) {
            const blueDotImg = document.createElement("img");
            blueDotImg.width = 21
            blueDotImg.height = 21
            blueDotImg.src = 'https://upload.wikimedia.org/wikipedia/commons/8/8b/GAudit_BlueDot.png';
            bluedot_maker = new AdvancedMarkerElement({
                map: map,
                content: blueDotImg,
                position: {
                    lat: current_lat,
                    lng: current_lng,
                },
             });
        } else {
            bluedot_maker.position = {
                lat: current_lat,
                lng: current_lng,
            };
        }

        // geocodeLatLng() // <-- getting charged!?
    },
    (err) => {
        console.error(err);
    },
    geolocation_options
    );
};

function geocodeLatLng() {
    const latlng = { lat: current_lat, lng: current_lng };
  
    geocoder
        .geocode({ location: latlng })
        .then((response) => {
            if (response.results[0]) {
                const formattedAddress = response.results[0].formatted_address
                const consoleText = document.getElementById("consoleText");
                consoleText.innerHTML = formattedAddress
            } else {
                // do nothing
            }
        })
        .catch((e) => console.log("Geocoder failed due to: " + e));
}

var colors = [
    "Orange",
    "Green",
    "#FF5349",
    "#5946B2",
    "#FF007C",
    "#0081AB",
    "#C46210",
    "#2E5894",
    "#9C2542",
    "#BF4F51",
    "#A57164",
    "#58427C",
    "#4A646C",
    "#85754E",
    "#319177",
    "#0A7E8C",
    "#9C7C38",
    "#8D4E85",
    "#8FD400",
    "#D98695",
    "#757575",
    "#0081AB",
    "#50BFE6",
    "Blue"
]

var includedLocations = []

function loadLocationsFromFile() {
    var doneCount = 0

    // const test = document.getElementById("test")
    // test.textContent = JSON.stringify(locationsB11, undefined, 2); 
    
    $.getJSON("routes/routeFiles.json", function(routeFiles) {
        for (const i in routeFiles) {
            $.getJSON("routes/" + routeFiles[i], function(routeFile) {
                includedLocations.push(routeFile)
                doneCount++
                if (doneCount == routeFiles.length) {
                    handleLocationFinishedLoading()
                }
            })
        }
    })
}

function handleLocationFinishedLoading() {
    includedLocations.sort((a, b) => a.name.localeCompare(b.name));
    loadParkingMetersFromFile()
}

function loadParkingMetersFromFile() {
    $.getJSON("meters/Parking_Meters.geojson", function(meterData) {
        parkingMeters = meterData.features
        handleParkingMetersFinishedLoading()
    })
}

function handleParkingMetersFinishedLoading() {
    // init map
    initMap()
}

loadLocationsFromFile()

