Ext.define('APPDSS.controller.map.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapcontroller',
    listen: {
        global: {
            openProjectMap: 'openProjectMap'
        }
    },
    openProjectMap: function(id){
        panel = this.getView().up('#projectTab');
        map = Ext.ComponentQuery.query('leafletmapview')[0].map;
        var store = Ext.getStore('Projects');
        var layer = store.getAt(id).data;
		/*var palette = Ext.decode(Ext.decode(layer.wms_conf).classifications);
		var legend = L.control({position: 'bottomright'});
		legend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend'),
				grades = palette,
				labels = [];

			// loop through our density intervals and generate a label with a colored square for each interval
			for (var i = 0; i < grades.length; i++) {
				div.innerHTML +=
					'<i style="background:' + grades[i].color + '"></i> ' +
					grades[i].value  + '<br>';
			}

			return div;
		};
		legend.addTo(map);*/
		if(layer.wms_endpoint != ''){
			var activeLayer = L.tileLayer.wms(layer.wms_endpoint,{
				layers: layer.wms_layers,
				format: layer.wms_format,
				transparent: layer.wms_transparent,
				attribution: layer.wms_attribution
			}).addTo(map);
			panel.setActiveItem(1);
		}else{
			Ext.Msg.alert('Attenzione','Nessun servizio WMS associato al progetto');
		}
        
    },
    onBack: function(){
        panel = this.getView().up('#projectTab');
        map = Ext.ComponentQuery.query('leafletmapview')[0].map;
        var activelayerId = Object.keys(map._layers)[Object.keys(map._layers).length-1];
        var activelayer = map._layers[activelayerId];
        map.removeLayer(activelayer);
        panel.setActiveItem(0);
    }

});