let map1 = L.map("map1", {
  center: [40.12723942199122, -111.43965476626704],
  zoom: 5,
});

let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map1);

let otm = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

let ewi = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

let consData = L.geoJSON(conserve).addTo(map1);
let trailData = L.geoJSON(trailsInfo);
let wildData = L.geoJSON(wild);

let baseMaps = {
  OpenStreetMap: osm,
  OpenTopoMap: otm,
  EsriWorldImagery: ewi,
};

let overlayMaps = {
  "Conservation Areas": consData,
  "Public Managed Trails": trailData,
  "Wilderness Study Areas": wildData,
};

L.control.layers(baseMaps, overlayMaps).addTo(map1);

let map2 = L.map("map2").setView([37.8, -96], 4);

let tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map2);

L.geoJson(obesityData).addTo(map2);

function getColor(o) {
  return o > 28
    ? "#FC4E2A"
    : o > 26
    ? "#FD8D3C"
    : o > 24
    ? "#FEB24C"
    : o > 22
    ? "#FED976"
    : "#FFEDA0";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.Obesity),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

L.geoJson(obesityData, { style: style }).addTo(map2)

function highlightFeature(e) {
  let layer = e.target;

  layer.setStyle({
    weight: 3,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map2.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

let geojson = L.geoJson(obesityData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map2);

let info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>Obesity in the US</h4>' + (props ?
    '<b>' + props.NAME + '</b><br />' + props.Obesity + '% are obese'
    : 'Hover over a state');
};

info.addTo(map2);

let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  let div = L.DomUtil.create('div', 'info legend'),
    grades = [20, 22, 24, 26, 28],
    labels = [];

  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map2);