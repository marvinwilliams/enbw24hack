var source;
var status = 0;

$(document).ready(function() {
    var longitude = 49.078191;
    var latitude = 8.855703;

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                })
                // source: new ol.source.OSM()
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
    source = new ol.source.Vector({
        projection: view.getProjection(),
        format: new ol.format.GeoJSON()
    });

    var circle = new ol.style.Circle({
        radius: 7,
        fill: null,
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 5
        })
    });

    var styles = {
        'Point': [new ol.style.Style({
            image: circle
        })],
        'Line': [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [255, 0, 0, 1],
                linedash: [40, 40],
                width: 3
            })
        })],
        'IconBackground': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 30,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 2
                })
            })
        }),
        'IconBackgroundHighlighted': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 30,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 3
                })
            })
        })

    };

    


    var getLine = function(color, width) {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width
            })
        })];
    };

    var getImageSrcByType = function(factoryType) {
        var iconSrc = '/static/data/default.png';
        switch (factoryType) {
            case 'Hochspannungsstation':
                {
                    iconSrc = '/static/data/Hochspannungsstation.png';
                    break;
                }
            case 'Hoechstspannungsstation':
                {
                    iconSrc = '/static/data/Hoechstspannungsstation.png';
                    break;
                }
            case 'Photovoltaikanlage':
                {
                    iconSrc = '/static/data/Photovoltaikanlage.png';
                    break;
                }
            case 'Windkraftanlage':
                {
                    iconSrc = '/static/data/Windkraftanlage.png';
                    break;
                }
            case 'Knoten':
                {
                    iconSrc = '/static/data/Hochspannungsstation.png';
                    break;
                }

        }
        return iconSrc;
    };

    var getImageIcon = function(factoryType, highlighted) {
        var iconSrc = getImageSrcByType(factoryType);

        var background = styles['IconBackground'];
        if (highlighted) {
            background = styles['IconBackgroundHighlighted'];
        }

        return [background, new ol.style.Style({
            image: new ol.style.Icon( /** @type {module:ol/style/Icon~Options} */ ({
                anchor: [0.5, 0.6],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: iconSrc,
                scale: 0.2
            }))
        })];
    };

    var getLineType = function(feature) {
        var capacity = 13000;
        var flow = feature.flow;
        if (flow > capacity) {
            return getLine([255, 0, 0, 1], 3);
        } else if (flow > capacity * 2/3) {
            return getLine([255, 255, 0, 1], 2);
        } else {
            return getLine([0, 255, 0, 1], 2);
        }

    };

    var styleFunction = function(feature, resolution) {
        var geometryType = feature.getGeometry().getType();
        // console.log(feature);
        var factoryType = feature.get('nodeType');
        switch (geometryType) {
            case 'LineString':
                // console.log(feature);
                return getLineType(feature);
                break;
            case 'Point':
                return getImageIcon(factoryType, false);
                break;
            default:
                {
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
        success: function(data) {
            // var features = geoJSONFormat.readFeatures(data.result, {featureProjection: view.getProjection()});
            var features = geoJSONFormat.readFeatures(data, {
                featureProjection: view.getProjection()
            });
	    features.forEach(function(f) {
		f.flow = 0;
		f.test = "test";
	    });
            source.addFeatures(features);
        },
        error: function(data, status, er) {
            console.log(er);
        }
    });

    var element = document.getElementById('popup');

    var menu = new ol.control.Overlay({
        closeBox: true,
        className: ("slide-left", "menu"),
        content: $("#menu")
    });
    map.addControl(menu);
    // A toggle control to show/hide the menu
    var t = new ol.control.Toggle({
        html: '<i class="fa fa-bars" ></i>',
        className: "menu",
        title: "Menu",
        onToggle: function() {
            menu.toggle();
        }
    });
    map.addControl(t);
    menu.toggle();

    var select = new ol.interaction.Select({
        // select: selectedStyle
    });
    map.addInteraction(select);

    // On selected => show/hide popup
    select.getFeatures().on('add', function(e) {

        var feature = e.element;
        var geometryType = feature.getGeometry().getType();
        console.log(feature);

        if (geometryType == 'Point') {
            feature.setStyle(getImageIcon(feature.get("nodeType"), true));
            var img = $("<img>").attr("src", getImageSrcByType(feature.get("nodeType"))).width(100);
            var info = $("<div>").append($("<h3>").text("Typ: " + feature.get("nodeType")));
            var id = $("<div>").append($("<h3>").text("Name: " + feature.get("id")));
            var content = $("<div>")
                .append(img)
                .append(info).append(id);
            $(".data").html(content);

        } else if (geometryType == 'LineString') {
            // feature.setStyle([]);
            feature.setStyle(getLineType(feature));
            var info = $("<div>").append($("<h3>").text("Typ: " + "Kante"));
            var id = $("<div>").append($("<h3>").text("Name: " + feature.get("id")));
            var capacity = $("<div>").append($("<h3>").text("Name: " + feature.get("capacity")));
            var content = $("<div>")
                .append(info).append(id).append(capacity);
            $(".data").html(content);

        }
    });
    select.getFeatures().on('remove', function(e) {
        var feature = e.element;
        var geometryType = feature.getGeometry().getType();
        if (geometryType == 'Point') {
            feature.setStyle(getImageIcon(feature.get("nodeType"), false));
        } else if (geometryType == 'LineString') {
            // feature.setStyle(getLineType(feature));
        }
        $(".data").html("");
    });

});
