import * as d3 from "d3";


let overlay, svg, g, projection, pathCreator;

function D3Init(map) {
  L.svg({clickable:true}).addTo(map) // we have to make the svg layer clickable 
  //Create selection using D3
  overlay = d3.select(map.getPanes().overlayPane)
  svg = overlay.select('svg').attr("pointer-events", "auto")
  // create a group that is hidden during zooming
  g = svg.append('g').attr('class', 'leaflet-zoom-hide')

  // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
  const projectPoint = function(x, y) {
    const point = map.latLngToLayerPoint(new L.LatLng(y, x))
    this.stream.point(point.x, point.y)
  }
  // Use d3's custom geo transform method to implement the above
  projection = d3.geoTransform({point: projectPoint})
  // creates geopath from projected points (SVG)
  pathCreator = d3.geoPath().projection(projection)

  // Draw Mode Init 
  InitDrawMode(map);
}

function DrawSquqreGrid(map) {


  fetch('penghu_hex_grid.geojson')
  .then(response => {
      if(!response.ok) {
        throw new Error('network response was not ok');
      }
      return response.json();
    })
    .then(geojsonData => {
      const areaPaths = g.selectAll('path')
        .data(geojsonData.features)
        .join('path')
        .attr('stroke-opacity', 0)
        .attr('fill-opacity', 0)
        .attr('fill', 'red')
        .attr('stroke', 'black')
        .attr("z-index", 3000)
        .attr('stroke-width', 2.5)
        .on("mouseover", function(d){
          d3.select(this)
            .style('fill-opacity', 0.5);
        })
        .on("mouseout", function(d){
          d3.select(this).transition()
            .duration('200')
            .style("fill-opacity", 0);
        })
        .on("click", function(d){
        })
        // Function to place svg based on zoom
        const onZoom = () => areaPaths.attr('d', pathCreator);
        // initialize positioning
        onZoom();
        // reset whenever map is moved
        map.on('zoomend', onZoom);
    })

}



var centerPoint, secondPoint, circle;
function InitDrawMode(map){

  function CalRadius(latlng1, latlng2) {
    let p1 = map.latLngToLayerPoint(latlng1);
    let p2 = map.latLngToLayerPoint(latlng2);
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  map.on('click', function(e) {
    // cirlce exist
    if(!centerPoint) { 
      centerPoint = e.latlng;
      if(circle) circle.remove();
      circle = g.append('circle')
          .attr('fill', 'steelblue')
          .attr('fill-opacity', 0.2)
          .attr('stroke', 'black')
          .attr('z-index', 2500)
          .attr('cx', map.latLngToLayerPoint(e.latlng).x)
          .attr('cy', map.latLngToLayerPoint(e.latlng).y)
          .attr('r', 0)
          .attr('pointer-events', 'none');
    } else if (!secondPoint) {
      secondPoint = e.latlng;
      circle.attr('r', CalRadius(centerPoint, secondPoint));
    } else {
      circle
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();
      circle = null;
      centerPoint = null;
      secondPoint = null;
    }
  })

  function update() { 
    if(circle) {
      circle
      .attr('cx', map.latLngToLayerPoint(centerPoint).x)
      .attr('cy', map.latLngToLayerPoint(centerPoint).y)
    }
    if(secondPoint) {
      circle.attr('r', CalRadius(centerPoint, secondPoint));
    }
  }

  function preview(e) {
    if(circle && !secondPoint) {
      circle
      .attr('r', CalRadius(centerPoint, e.latlng));
    }
  }

  map.on('zoomend', update);
  map.on('mousemove', preview);
}

export {D3Init, DrawSquqreGrid};
