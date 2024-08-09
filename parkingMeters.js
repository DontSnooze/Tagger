var map;
var geocoder;
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

    // add meters
    for (let i in parkingMeters) {
        let meter = parkingMeters[i]
        let color = "black"

        let streetName = meter.properties.STREET
        let meterIdPrefix = meter.properties.G_ZONE
        let zone = meter.properties.G_PM_ZONE
        let payPolicy = meter.properties.PAY_POLICY
        let meterId = meter.properties.METER_ID

        var title = "Meter ID Prefix: " + meterIdPrefix
        title += "\nMeter ID: " + meterId
        title += "\nStreet Name: " + streetName
        title += "\nPay Policy: " + payPolicy
        title += "\nZone: " + zone

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

async function addMeter(location, title, color, infoWindow) {
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

function loadParkingMetersFromFile() {
    $.getJSON("meters/Parking_Meters.geojson", function(meterData) {
        parkingMeters = meterData.features
        handleMetersFinishedLoading()
    })
}

function handleMetersFinishedLoading() {
    initMap();
}

loadParkingMetersFromFile()