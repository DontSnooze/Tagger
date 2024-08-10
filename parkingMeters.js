var map;
var geocoder;
var parkingMeters = []
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
    
    var colorIndex = -1
    var blkNoColorsDict = []
    var gZoneColorsDict = []
    var colorCount = 0

    // add meters
    for (let i in parkingMeters) {
        let meter = parkingMeters[i]
        
        let objectId = meter.properties.OBJECTID
        let meterId = meter.properties.METER_ID
        let blkNo = meter.properties.BLK_NO
        let meterType = meter.properties.METER_TYPE
        let streetName = meter.properties.STREET
        var gZone = meter.properties.G_ZONE
        let gPmZone = meter.properties.G_PM_ZONE
        let gDistrict = meter.properties.G_DISTRICT
        let gPassportZones = meter.properties.G_PASSPORT_ZONES
        let payPolicy = meter.properties.PAY_POLICY

        var color = ""
        

        // color by blkNo
        // if (blkNoColorsDict[blkNo] == null) {
        //     colorIndex++

        //     if (colorIndex >= colors.length) {
        //         colorIndex = 0
        //     }

        //     blkNoColorsDict[blkNo] = colors[colorIndex]
        // }
        // color = blkNoColorsDict[blkNo]

        // color by gZone
        if (gZone == null) {
            gZone = "null"
            gZoneColorsDict[gZone] = "Gray"
            color = "Gray"
        }

        if (gZoneColorsDict[gZone] == null) {
            colorIndex++

            if (colorIndex >= colors.length) {
                colorIndex = 0
            }

            gZoneColorsDict[gZone] = colors[colorIndex]
            console.log(gZone)
            console.log(gZoneColorsDict[gZone])
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