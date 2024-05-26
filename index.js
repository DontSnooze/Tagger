let map;

async function initMap() {
    const position = { lat: 42.3507752636, lng: -71.0748797005 };
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        center: position,
        zoom: 15,
        mapId: "TAGGER_MAP_ID",
    });

    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "We out here!"
    });
}

initMap();