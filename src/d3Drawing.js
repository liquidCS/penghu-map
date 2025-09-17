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


var currentHexagon;
function DrawSquqreGrid(map) {
  fetch('penghu_smallHex_grid.geojson')
  .then(response => {
      if(!response.ok) {
        throw new Error('network response was not ok');
      }
      return response.json();
    })
    .then(geojsonData => {
      // Create the hexagons using geojson covering all islands
      const areaPaths = g.selectAll('path')
        .data(geojsonData.features)
        .join('path')
        .attr('stroke-opacity', 0)
        .attr('fill-opacity', 0)
        .attr('fill', 'red')
        .attr('stroke', 'black')
        .attr("z-index", 3000)
        .attr('stroke-width', 2.5)
        .on("mouseover", function(e){
          if(!centerPoint) {
            d3.select(this).attr('fill-opacity', 0.5);
            currentHexagon = e; 
          }
        })
        .on("mouseout", function(e){
          if(!centerPoint) {
            d3.select(this).transition()
              .duration('200')
              .attr("fill-opacity", 0);
          }
        })
        .on("click", function(e){
        })
        // Redraw hexagons when map is zoomed 
        const onZoom = () => areaPaths.attr('d', pathCreator);
        onZoom();
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

  function GetCenterPoint(bbox) {
    const cx = bbox.x + bbox.width / 2;  
    const cy = bbox.y + bbox.height / 2; 
    return {cx, cy}; 
  }

  map.on('click', function(e) {
    // cirlce exist
    if(!centerPoint) { 
      // Snap to hover hexagon center
      d3.select(currentHexagon.target).attr('fill', 'yellow');
      centerPoint = L.geoJSON(currentHexagon.target.__data__).getBounds().getCenter();

      if(circle) circle.remove();
      circle = g.append('circle')
          .attr('fill', 'steelblue')
          .attr('fill-opacity', 0.2)
          .attr('stroke', 'black')
          .attr('z-index', 2500)
          .attr('cx', map.latLngToLayerPoint(centerPoint).x)
          .attr('cy', map.latLngToLayerPoint(centerPoint).y)
          .attr('r', 0)
          .attr('pointer-events', 'none');
    } else if (!secondPoint) {
      // Circle center is determined
      secondPoint = e.latlng;
      circle.attr('r', CalRadius(centerPoint, secondPoint));
    } else {
      // Remove selection circle
      circle
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();
      d3.selectAll('path').transition().duration(500).attr('fill-opacity', 0);
      d3.select(currentHexagon.target).attr('fill', 'red'); 
      circle = null;
      centerPoint = null;
      secondPoint = null;
    }
  })

  // Function to update selection circle when zoomed 
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

  // Function to show preview of the selected hexagons
  function preview(e) {
    if(circle && !secondPoint) {
      circle.attr('r', CalRadius(centerPoint, e.latlng));

      // Change selected color 
      d3.selectAll('path').attr('fill-opacity', function() {
        const {cx, cy}= GetCenterPoint(this.getBBox());
        const center = map.latLngToLayerPoint(centerPoint); 
        if (Math.pow(cx - center.x, 2) + Math.pow(cy - center.y, 2) > Math.pow(CalRadius(centerPoint, e.latlng), 2)) {
          return 0;
        }
        else return 1;
      })

     //  // Preview selected hexagon
     //  d3.selectAll('path').filter(function() {
     //    const {cx, cy}= GetCenterPoint(this.getBBox());
     //    const center = map.latLngToLayerPoint(centerPoint); 
     //    return Math.pow(cx - center.x, 2) + Math.pow(cy - center.y, 2) <= Math.pow(CalRadius(centerPoint, e.latlng), 2);
     //  }).style('fill-opacity', 1);
     //  // unselect
     //  d3.selectAll('path').filter(function() {
     //    const {cx, cy}= GetCenterPoint(this.getBBox());
     //    const center = map.latLngToLayerPoint(centerPoint); 
     //    return Math.pow(cx - center.x, 2) + Math.pow(cy - center.y, 2) > Math.pow(CalRadius(centerPoint, e.latlng), 2);
     //  }).style('fill-opacity', 0);
    }
  }

  map.on('zoomend', update);
  map.on('mousemove', preview);
}

export {D3Init, DrawSquqreGrid};
