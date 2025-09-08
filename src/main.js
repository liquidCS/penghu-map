import L from 'leaflet';
import glify from 'leaflet.glify';

var map = L.map('map').setView([23.561942, 119.612923], 13);

var currentTileLayer = L.tileLayer('https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/EPSG:3857/{z}/{y}/{x}', {
    attribution: 'Taiwan National Land Surveying and Mapping Center'
}).addTo(map);

var satelliteTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var baseLayers = {
    "NLSC": currentTileLayer,
    "ARCGISON": satelliteTileLayer
};

L.control.layers(baseLayers).addTo(map);





var currentGeoJsonLayer = null;

function loadGeoJSON(filename) {
    if (currentGeoJsonLayer) {
        currentGeoJsonLayer.remove();
    }

    fetch(filename)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(geojsonData => {
        currentGeoJsonLayer = glify.shapes({
            map,
            data: geojsonData,
            color: {r: 255,g: 0, b: 0, a:0.4},
            border: true,
        }).addTo(map);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}



// Initial load
loadGeoJSON('penghu_hex_grid.geojson');

document.getElementById('showBoundaries').addEventListener('click', function() {
    loadGeoJSON('penghu.geojson');
});

document.getElementById('showHexGrid').addEventListener('click', function() {
    loadGeoJSON('penghu_hex_grid.geojson');
});

document.getElementById('showSquareGrid').addEventListener('click', function() {
    loadGeoJSON('penghu_square_grid.geojson'); // Assuming 'penghu_hex.geojson' is the other file
});
