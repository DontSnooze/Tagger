let map;

const initialPosition = { lat: 42.3507752636, lng: -71.0748797005 };
const taggerMapId = "2f1208d17811f870"
const testMapId = "e70c456f1629620a"

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
        mapTypeControl: false,
        mapId: testMapId,
    });
    
    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();
    
    var colorIndex = 0
    for (let i in includedLocations) {
        let locations = includedLocations[i]

        // add markers
        let color = colors[colorIndex]
        addMarkers(locations, color, infoWindow)

        colorIndex++
        if (colorIndex == colors.length) {
            colorIndex = 0
        }
    }
}

function addMarkers(locations, color, infoWindow) {
    var colorIndex = 0
    for (let i in locations.route) {
        let path = locations.route[i]

        for (let i in path.coords) {
            let position = path.coords[i]
            let title = "[" + locations.name + "] " + path.title 
            addMarker(position, title, color, infoWindow)
        }

        drawLines(path.coords, colors[colorIndex])
        colorIndex++
        if (colorIndex == colors.length) {
            colorIndex = 0
        }
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

function drawLines(coordinates, color) {
    var line= new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    
    line.setMap(map);
}

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
                { lat: 42.3479116515225, lng: -71.07876779863503 },
                { lat: 42.34539394680277, lng: -71.08174339004772 }
            ]
        },
        {
            title: "Buswell Drive, St Marys to Mountfort",
            coords: [ 
                { lat: 42.346441559059315, lng: -71.07895787896923 },
                { lat: 42.34481792126827, lng: -71.08092782546558 }
            ]
        },
        {
            title: "Arundel St, Mountfort to Beacon St",
            coords: [ 
                { lat: 42.345917829734994, lng: -71.07532449320308 },
                { lat: 42.343250968610256, lng: -71.07859611359251 }
            ]
        },
        {
            title: "Beacon St, St Marys to Brookline Line",
            coords: [ 
                { lat: 42.34535423710304, lng: -71.08025261191207 },
                { lat: 42.34482647088192, lng: -71.07948299049313 }
            ]
        },
        {
            title: "Maitland St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.346344506962815, lng: -71.08025340783618 },
                { lat: 42.345706787462476, lng: -71.07926394578763 }
            ]
        },
        {
            title: "Miner St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.34689130434067, lng: -71.07955859922704 },
                { lat: 42.346520501460134, lng: -71.0789473924236 }
            ]
        },
        {
            title: "Aberdeen St, Beacon St to Dead End",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Keswick St, Beacon St to Medfield St",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Medfield St, Park Drive to St Marys",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Mountfort, Beacon St to St Marys",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
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
                { lat: 42.3479116515225, lng: -71.07876779863503 },
                { lat: 42.34539394680277, lng: -71.08174339004772 }
            ]
        },
        {
            title: "Peterborough St, Park Drive to Park Drive",
            coords: [ 
                { lat: 42.346441559059315, lng: -71.07895787896923 },
                { lat: 42.34481792126827, lng: -71.08092782546558 }
            ]
        },
        {
            title: "Queensberry St, Park Drive to Park Drive",
            coords: [ 
                { lat: 42.345917829734994, lng: -71.07532449320308 },
                { lat: 42.343250968610256, lng: -71.07859611359251 }
            ]
        },
        {
            title: "Kilmarnock St, Brookline Ave to Park Drive",
            coords: [ 
                { lat: 42.34535423710304, lng: -71.08025261191207 },
                { lat: 42.34482647088192, lng: -71.07948299049313 }
            ]
        },
        {
            title: "Jersey St, Park Drive to Brookline Ave",
            coords: [ 
                { lat: 42.346344506962815, lng: -71.08025340783618 },
                { lat: 42.345706787462476, lng: -71.07926394578763 }
            ]
        },
        {
            title: "Van Ness, Kilmarnock St to Ipswich St",
            coords: [ 
                { lat: 42.34689130434067, lng: -71.07955859922704 },
                { lat: 42.346520501460134, lng: -71.0789473924236 }
            ]
        },
        {
            title: "Brookline Ave, Park Drive to Comm Ave",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Overland St, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Burlington St, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Fullerton St, Brookline Ave to Dead End",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Lansdowne St, Brookline Ave to Ipswich St",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
        {
            title: "Ipswich St, Boylston St to Boylston St",
            coords: [ 
                { lat: 42.343793691773215, lng: -71.07797016375741 },
                { lat: 42.34465479751293, lng: -71.07918142790867 }
            ]
        },
    ]
}

var includedLocations = [
    locationsB9,
    locationsB11,
    locationsC1
]

initMap();
