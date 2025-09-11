import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as d3 from "d3";
import {D3Init, DrawSquqreGrid} from './d3Drawing.js'

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

// Grids
D3Init(map);
DrawSquqreGrid(map);
