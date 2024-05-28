let map;

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
    
    var colorIndex = 0

    let locationsFromQuery = getLocationsFromQuery()

    for (let i in includedLocations) {
        let locations = includedLocations[i]

        if (locationsFromQuery.length && !locationsFromQuery.includes(locations.name)) {
            continue
        }

        // add markers
        let color = colors[colorIndex]
        addMarkers(locations, color, infoWindow)

        colorIndex++
        if (colorIndex == colors.length) {
            colorIndex = 0
        }
    }

    setupSideNav()
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
    drawArea(areaMarkers, color, locations.name, infoWindow)
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

function drawLines(coordinates, color) {
    var line= new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 5
    });
    
    line.setMap(map);
}

function drawArea(coordinates, color, title, infoWindow) {
    const areaShade = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: color,
        strokeOpacity: 0.1,
        strokeWeight: 0.5,
        fillColor: color,
        fillOpacity: 0.3,
      });
    
      areaShade.setMap(map);

      areaShade.addListener("click", ({ domEvent, latLng }) => {
        const { target } = domEvent;
        console.log("click")
        infoWindow.close();
        infoWindow.setContent(title);
        // bug fix needed: location is off.. window opens at last position it was opened (doesnt show up if wasnt open b4)
        infoWindow.open(areaShade.map, areaShade.placeId);
    });
}

function setupGetCurrentPosition() {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(locationButton);

    locationButton.addEventListener("click", () => {
        if (current_lat && current_lng) {
            const pos = { lat: current_lat, lng: current_lng }
            map.panTo(pos)
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
    },
    (err) => {
        console.error(err);
    },
    geolocation_options
    );
};

var colors = [
    "Blue",
    "Orange",
    "Green",
    "#50BFE6",
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
    "#0081AB"
]

var locationsB9 = {
    name: "B9",
    route: [
        {
            title: "Boylston (SS), Hemenway to Dalton",
            coords: [
                { lat: 42.34681070122661, lng: -71.08915855071963 },
                { lat: 42.34777010948075, lng: -71.0856120428559 }
            ]
        },
        {
            title: "Boylston (NS), Ipswitch to Mass Ave",
            coords: [
                { lat: 42.34698908122273, lng: -71.08917544164402 },
                { lat: 42.347342329249074, lng: -71.08790657569338 }
            ]
        },
        {
            title: "Cambria, Boylston to Dead end",
            coords: [
                { lat: 42.34734633942874, lng: -71.08712347498951 },
                { lat: 42.34735084657487, lng: -71.0855013102442 }
            ]
        },
        {
            title: "Scotia, St Cecilia to Dalton",
            coords: [
                { lat: 42.346976543698254, lng: -71.08645480024657 },
                { lat: 42.346801441967365, lng: -71.08519231680387 }
            ]
        },
        {
            title: "Belvidere, Mass Ave to Huntington Ave",
            coords: [
                { lat: 42.34648925159813, lng: -71.08723533722441 },
                { lat: 42.345530645957496, lng: -71.08190109842798 }
            ]
        },
        {
            title: "St Germain, Mass Ave to Dalton",
            coords: [
                { lat: 42.34592783269012, lng: -71.08693195739481 },
                { lat: 42.34555147020453, lng: -71.08429525119142 }
            ]
        },
        {
            title: "Clearway, Mass Ave to Belvidere",
            coords: [
                { lat: 42.34543140316273, lng: -71.08669140481311 },
                { lat: 42.34508463061328, lng: -71.08438368914052 },
                { lat: 42.345842400906584, lng: -71.08344863106285 }
            ]
        },
        {
            title: "Norway, Hemenway to Edgerly",
            coords: [
                { lat: 42.345422045692516, lng: -71.08943357428893 },
                { lat: 42.3452103215781, lng: -71.08770029408996 }
            ]
        },
        {
            title: "Haviland, Hemenway to Mass Ave",
            coords: [
                { lat: 42.34631623843674, lng: -71.08918516018542 },
                { lat: 42.346254522186015, lng: -71.08882204022821 },
                { lat: 42.346598649298706, lng: -71.08755689518543 }
            ]
        },
        {
            title: "Stoneholm, Norway to Edgerly",
            coords: [
                { lat: 42.34535439641728, lng: -71.08868232079551 },
                { lat: 42.34571057835012, lng: -71.088571504276 },
                { lat: 42.34587743654601, lng: -71.08802676784966 }
            ]
        },
        {
            title: "Burbank, Hemenway to Edgerly",
            coords: [
                { lat: 42.34460326561531, lng: -71.0896528455358 },
                { lat: 42.34435922723569, lng: -71.08729479246686 }
            ]
        },
        {
            title: "Westland Ave (NS), Hemenway to Mass Ave",
            coords: [
                { lat: 42.34405353691379, lng: -71.0899005243609 },
                { lat: 42.343382742995686, lng: -71.08604695479198 }
            ]
        },
        {
            title: "Hemenway, Boylston to Westland Ave",
            coords: [
                { lat: 42.34681038964049, lng: -71.08915451890884 },
                { lat: 42.34405970496326, lng: -71.08989114241106 }
            ]
        },
        {
            title: "Edgerly, Haviland to Westland Ave",
            coords: [
                { lat: 42.346365998535134, lng: -71.08820227414228 },
                { lat: 42.34354227139164, lng: -71.08680487961051 }
            ]
        },
        {
            title: "St Cecilia, Boylston to Belvidere",
            coords: [
                { lat: 42.34747371489971, lng: -71.08671208223582 },
                { lat: 42.346974522423615, lng: -71.0864950745582 },
                { lat: 42.34645398707678, lng: -71.08666338597375 }
            ]
        },
        {
            title: "Mass Ave, Boylston to Huntington Ave",
            coords: [
                { lat: 42.34726620826255, lng: -71.0877165023054 },
                { lat: 42.34339322855445, lng: -71.08579079600699 },
                { lat: 42.34290594350567, lng: -71.08508654721513 }
            ]
        },
        {
            title: "Dalton, Boylston to Belvidere",
            coords: [
                { lat: 42.347797652580766, lng: -71.08553527833178 },
                { lat: 42.34626908105676, lng: -71.08471350834871 }
            ]
        },
    ]
}

var locationsB11 = {
    name: "B11",
    route: [
        {
            title: "Huntington Ave, Exeter to West Newton",
            coords: [ 
                { lat: 42.3479116515225, lng: -71.07876779863503 },
                { lat: 42.34539394680277, lng: -71.08174339004772 }
            ]
        },
        {
            title: "St Botolph, Harcourt to West Newton",
            coords: [ 
                { lat: 42.346441559059315, lng: -71.07895787896923 },
                { lat: 42.34481792126827, lng: -71.08092782546558 }
            ]
        },
        {
            title: "Columbus Ave (NS), Dartmouth to West Newton",
            coords: [ 
                { lat: 42.345917829734994, lng: -71.07532449320308 },
                { lat: 42.343250968610256, lng: -71.07859611359251 }
            ]
        },
        {
            title: "Follen, St Botolph to Dead End",
            coords: [ 
                { lat: 42.34535423710304, lng: -71.08025261191207 },
                { lat: 42.34482647088192, lng: -71.07948299049313 }
            ]
        },
        {
            title: "Garrison, Huntington to Dead End",
            coords: [ 
                { lat: 42.346344506962815, lng: -71.08025340783618 },
                { lat: 42.345706787462476, lng: -71.07926394578763 }
            ]
        },
        {
            title: "Harcourt, Huntington to Dead End",
            coords: [ 
                { lat: 42.34689130434067, lng: -71.07955859922704 },
                { lat: 42.346520501460134, lng: -71.0789473924236 }
            ]
        },
        {
            title: "Braddock, Columbus Ave to Dead End",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Holyoke, Columbus Ave to Dead End",
            coords: [ 
                { lat: 42.344348315753265, lng: -71.07727561871434 },
                { lat: 42.345178894583476, lng: -71.07849763408936 }
            ]
        },
        {
            title: "West Canton, Columbus Ave to Dead End",
            coords: [ 
                { lat: 42.34488615084444, lng: -71.07659092166129 },
                { lat: 42.3458015147466, lng: -71.07793304428343 }
            ]
        },
        {
            title: "Yarmouth, Columbus Ave to Dead End",
            coords: [ 
                { lat: 42.345438152264386, lng: -71.07592804358433 },
                { lat: 42.34630847057417, lng: -71.07725103580538 }
            ]
        },
        {
            title: "West Newton (ES), Columbus Ave to Sparrow Park",
            coords: [ 
                { lat: 42.34328503542355, lng: -71.07857914821415 },
                { lat: 42.34421135705598, lng: -71.0799554327784 }
            ]
        },
    ]
}

var locationsC1 = {
    name: "C1",
    route: [
        {
            title: "Deerfield, Comm Ave (Outbound) to Dead End",
            coords: [ 
                { lat: 42.34901362009631, lng: -71.09715399448872 },
                { lat: 42.350597432113325, lng: -71.09777310691526 }
            ]
        },
        {
            title: "Comm Ave (Outbound), Deerfield St to University Road",
            coords: [ 
                { lat: 42.34901339179426, lng: -71.09715915239265 },
                { lat: 42.350515755250555, lng: -71.10966630257896 }
            ]
        },
        {
            title: "Comm Ave (IN), Mountfort to Beacon St",
            coords: [ 
                { lat: 42.35042969652931, lng: -71.11088399863364 },
                { lat: 42.34882617240611, lng: -71.09746174920998 }
            ]
        },
        {
            title: "Bay State Road, Deerfield to Granby St",
            coords: [ 
                { lat: 42.35011955090093, lng: -71.09768269347401 },
                { lat: 42.35065923193126, lng: -71.1034273040822 }
            ]
        },
        {
            title: "Silber Way, Comm Ave to Dead End",
            coords: [ 
                { lat: 42.34939929929193, lng: -71.10056494829894 },
                { lat: 42.35077314990106, lng: -71.10028797368888 }
            ]
        },
        {
            title: "Granby St, Comm Ave to Dead End",
            coords: [ 
                { lat: 42.34986099004203, lng: -71.10362087324668 },
                { lat: 42.35097265291431, lng: -71.1033131956898 }
            ]
        },
        {
            title: "University Road, Comm Ave to Storrow Drive",
            coords: [ 
                { lat: 42.35050969534677, lng: -71.10967596327004 },
                { lat: 42.35138231842755, lng: -71.10950679932142 }
            ]
        },
    ]
}

var locationsC2 = {
    name: "C2",
    route: [
        {
            title: "Park Drive, Beacon St to Mountfort",
            coords: [ 
                { lat: 42.346688449713305, lng: -71.10513281988591 },
                { lat: 42.348420641199546, lng: -71.10601674381891 }
            ]
        },
        {
            title: "Buswell Drive, St Marys to Mountfort",
            coords: [ 
                { lat: 42.34709032593256, lng: -71.10717385193063 },
                { lat: 42.348031813810245, lng: -71.10388937536617 }
            ]
        },
        {
            title: "Arundel St, Mountfort to Beacon St",
            coords: [ 
                { lat: 42.348013417609515, lng: -71.10375508715813 },
                { lat: 42.34712699841533, lng: -71.10333545724893 }
            ]
        },
        {
            title: "Beacon St, St Marys to Brookline Line (Not sure on where the 'Brookline Line' is)",
            coords: [ 
                { lat: 42.34603351504819, lng: -71.10671601630749 },
                { lat: 42.34538538445681, lng: -71.10906602375852 }
            ]
        },
        {
            title: "Maitland St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.34751399955248, lng: -71.10180756541749 },
                { lat: 42.34711240401689, lng: -71.10155892410411 },
                { lat: 42.346940145720396, lng: -71.1012490680481 }
            ]
        },
        {
            title: "Miner St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.34708627289578, lng: -71.10331410380587 },
                { lat: 42.34614340456419, lng: -71.10281353080781 },
                { lat: 42.345419557171695, lng: -71.10175745379327 }
            ]
        },
        {
            title: "Aberdeen St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.34685774521892, lng: -71.10408117125681 },
                { lat: 42.34589848709343, lng: -71.10358868165802 }
            ]
        },
        {
            title: "Keswick St, Beacon St to Medfield St",
            coords: [ 
                { lat: 42.34624052930465, lng: -71.10599476685839 },
                { lat: 42.34543139061755, lng: -71.10558722350801 }
            ]
        },
        {
            title: "Medfield St, Park Drive to St Marys",
            coords: [ 
                { lat: 42.34568012609266, lng: -71.10465203898649 },
                { lat: 42.34524323997502, lng: -71.10631600822977 }
            ]
        },
        {
            title: "Mountfort, Beacon St to St Marys",
            coords: [ 
                { lat: 42.347628058233404, lng: -71.10189049115938 },
                { lat: 42.34864742726966, lng: -71.10690236518019 }
            ]
        },
    ]
}
var locationsC3 = {
    name: "C3",
    route: [
        {
            title: "Boylston St, Park Drive to Park Drive",
            coords: [ 
                { lat: 42.34333774598236, lng: -71.10253848437131 },
                { lat: 42.34552053089145, lng: -71.09438686954492 }
            ]
        },
        {
            title: "Peterborough St, Park Drive to Park Drive",
            coords: [ 
                { lat: 42.34251493835198, lng: -71.1018001881368 },
                { lat: 42.34443502427732, lng: -71.09469593283106 }
            ]
        },
        {
            title: "Queensberry St, Park Drive to Park Drive",
            coords: [ 
                { lat: 42.34176216988335, lng: -71.10104444862289 },
                { lat: 42.343466127693326, lng: -71.09459045907212 }
            ]
        },
        {
            title: "Kilmarnock St, Brookline Ave to Park Drive",
            coords: [ 
                { lat: 42.344917538785396, lng: -71.10098711978169 },
                { lat:42.34472913904342, lng: -71.10043564659227 },
                { lat: 42.340930519889646, lng: -71.09852104284101 }
            ]
        },
        {
            title: "Jersey St, Park Drive to Brookline Ave",
            coords: [ 
                { lat: 42.34195087456678, lng: -71.09654162371245 },
                { lat: 42.34681494212804, lng: -71.098955455558 }
            ]
        },
        {
            title: "Van Ness, Kilmarnock St to Ipswich St",
            coords: [ 
                { lat: 42.34477985245983, lng: -71.10045607571752 },
                { lat: 42.34601974783107, lng: -71.09574894172592 }
            ]
        },
        {
            title: "Brookline Ave, Park Drive to Comm Ave",
            coords: [ 
                { lat: 42.34338297899702, lng: -71.10263622200006 },
                { lat: 42.34870858321632, lng: -71.09709670648743 }
            ]
        },
        {
            title: "Overland St, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.34609924880648, lng: -71.09977319301542 },
                { lat: 42.34690056566813, lng: -71.10118145792123 }
            ]
        },
        {
            title: "Burlington Ave, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.345506618258305, lng: -71.10038236785341 },
                { lat: 42.34639677382428, lng: -71.101939096633 }
            ]
        },
        {
            title: "Fullerton St, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.34492962731468, lng: -71.10099953252025 },
                { lat: 42.34538747601117, lng: -71.10178710832295 }
            ]
        },
        {
            title: "Lansdowne St, Brookline Ave to Ipswich St",
            coords: [ 
                { lat: 42.347223867933245, lng: -71.0985037576922 },
                { lat: 42.34717034042794, lng: -71.09449941907238 }
            ]
        },
        {
            title: "Ipswich St, Boylston St to Boylston St",
            coords: [ 
                { lat: 42.345248511297626, lng: -71.09533710009013 },
                { lat: 42.34601477988076, lng: -71.09567334859854 },
                { lat: 42.347511047688265, lng: -71.0939640853475 },
                { lat: 42.34753693436113, lng: -71.09238792046435 }
            ]
        },
    ]
}

var includedLocations = [
    locationsB9,
    locationsB11,
    locationsC1,
    locationsC2,
    locationsC3
]

initMap();
