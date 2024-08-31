var map;
var geocoder;

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
    let infoWindow = new InfoWindow();

    // initialize the goecoder
    geocoder = new google.maps.Geocoder();

    setupGetCurrentPosition()
    monitor_position(map)

    // Configure the click listener.
    map.addListener("click", (mapsMouseEvent) => {
        // Close the current InfoWindow.
        infoWindow.close();
        // Create a new InfoWindow.
        infoWindow = new google.maps.InfoWindow({
          position: mapsMouseEvent.latLng,
        });
        infoWindow.setContent(
          JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2),
        );
        infoWindow.open(map);
        geocodeClickLatLng(mapsMouseEvent.latLng)
    });
}

function addLineBreak(element) {
    linebreak = document.createElement("br");
    element.appendChild(linebreak);
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

        geocodeCurrentLocationLatLng()
    },
    (err) => {
        console.error(err);
    },
    geolocation_options
    );
};

function geocodeCurrentLocationLatLng() {
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

function geocodeClickLatLng(latlng) {
    // const latlng = { lat: lat, lng: lng };
  
    geocoder
        .geocode({ location: latlng })
        .then((response) => {
            if (response.results[0]) {
                const formattedAddress = response.results[0].formatted_address
                const selectedText = document.getElementById("selectedText");
                selectedText.innerHTML = formattedAddress

                const coordinatesInput = document.getElementById("tag-type-form-coordinates")
                coordinatesInput.value =  latlng
            } else {
                // do nothing
            }
        })
        .catch((e) => console.log("Geocoder failed due to: " + e));
}

function startMapInit() {
    initMap()
}

startMapInit()