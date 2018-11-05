$(document).ready(function () {
    var longitude  =49.078191;
    var latitude= 8.855703;


  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([latitude, longitude], 'EPSG:4326', 'EPSG:3857'),
      zoom: 11
      // maxZoom: 17
    })
  });
  var view = map.getView();

  var geoJSONFormat = new ol.format.GeoJSON({
    'defaultDataProjection': 'EPSG:4326' // view.getProjection()
  });
    var source = new ol.source.Vector({
        projection: view.getProjection(),
        format: new ol.format.GeoJSON()
    });

    var circle = new ol.style.Circle({
        radius: 7,
        fill: null,
        stroke: new ol.style.Stroke({color: 'red', width: 5})
    });

    var styles = {
        'Point': [new ol.style.Style({
            image: circle
        })],
        'Line': [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [255, 0, 0, 1],
                linedash: [40,40],
                width: 3
            })
        })]
    };

    var getLine = function(color, width) {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width
            })
        })];
    };

    var getImageIcon = function(factoryType) {
        var iconSrc = '/static/data/default.png';

        switch (factoryType) {
        case 'Hochspannungsstation': {
            iconSrc = '/static/data/Hochspannungsstation.png';
            break;
        }
        case 'Hoechstspannungsstation': {
            iconSrc = '/static/data/Hoechstspannungsstation.png';
            break;
        }
        case 'Photovoltaikanlage' : {
            iconSrc =  '/static/data/Photovoltaikanlage.png';
            break;
        }
        case 'Windkraftanlage' : {
            iconSrc = '/static/data/Windkraftanlage.png';
            break;
        }
        case 'Knoten' : {
            iconSrc = '/static/data/Hochspannungsstation.png';
            break;
        }

        }
        return new ol.style.Style({
            image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: iconSrc,
                scale: 0.3
            }))
        });
    };


    var styleFunction = function (feature, resolution) {
        var geometryType = feature.getGeometry().getType();
        // console.log(feature);
        var factoryType = feature.get('nodeType');

        switch (geometryType) {
        case 'LineString':
            console.log(feature);
            var capacity = feature.get('capacity');
            var currentCapacity = feature.get('currentCapacity');

            if (currentCapacity == undefined || currentCapacity == null) {
                currentCapacity = 0;
            }

            if (currentCapacity > capacity) {
                return getLine([255, 0, 0, 1], 3);
            } else if (currentCapacity > capacity / 2) {
                return getLine([255, 255, 0, 1], 2);
            } else {
                return getLine([0, 255, 0, 1], 2);
            }
            break;
        case 'Point':
            return getImageIcon(factoryType);
            break;
        default: {
            return styles['Point'];
        }
        }
    };

    var layer = new ol.layer.Vector({
        title: 'Points of Interest',
        source: source,
        style: styleFunction
    });

    map.addLayer(layer);

    $.ajax({
        url: pointsOfInterestUrl,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        mimeType: 'application/json',
        success: function (data) {
            // var features = geoJSONFormat.readFeatures(data.result, {featureProjection: view.getProjection()});
            var features = geoJSONFormat.readFeatures(data, {featureProjection: view.getProjection()});
            source.addFeatures(features);
        },
        error: function (data, status, er) {
            console.log(er);
        }
    });

  var element = document.getElementById('popup');

  var popup = new ol.Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false
  });
  map.addOverlay(popup);

  // display popup on click
  map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature, layer) {
        console.log(feature);
        return feature;
      });
    if (feature) {
      var geometry = feature.getGeometry();
      var coord = geometry.getCoordinates();
      popup.setPosition(coord);
      $(element).popover('destroy')
        .popover({
          'placement': 'top',
          'html': true,
          'content': feature.get('Name')
        })
        .popover('show');
    } else {
      $(element).popover('destroy');
    }
  });

});
