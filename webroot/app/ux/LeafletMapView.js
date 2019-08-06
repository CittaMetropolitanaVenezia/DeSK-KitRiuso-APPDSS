Ext.define('APPDSS.ux.LeafletMapView', {
    extend: 'Ext.Component',
    alias: 'widget.leafletmapview',
    id: 'leafletmap',
    config:{
        map: null
    },
    afterRender: function(t, eOpts){
        this.callParent(arguments);
        
        var leafletRef = window.L;
        if (leafletRef == null){
            this.update('No leaflet library loaded');
        } else {
			var me = this;	
			Ext.Ajax.request({
            url:  App.security.TokenStorage.getUrl()+'configuration/index',
            method: 'GET',
            success: function (response) {
                var result = Ext.decode(response.responseText);
                data = result.data;
				xmin = data.ll_x_min;
				ymin = data.ll_y_min;
				xmax = data.ll_x_max;
				ymax = data.ll_y_max;
				//xmin - y min
				//xmax - y max
				var maxBounds = L.latLngBounds(
					L.latLng(xmin,ymin),			
					L.latLng(xmax,ymax)
							
				);
				var ss = 'EPSG'+data.ll_displayProj;
				var crs = L.CRS[ss];
				mapOptions = {
						maxBounds: maxBounds,
						minZoom: 7,
						maxZoom: 18,
						zoomControl: false,
						crs: crs
					};
				var map = L.map(me.getId(), mapOptions);
							
				me.setMap(map);
				map.fitBounds(maxBounds);	
				map.setMaxBounds(maxBounds);		
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 18
				}).addTo(map);	
            },
            failure: function (response) {
                var result = Ext.decode(response.responseText);
                Ext.Msg.alert('Errore', 'Errore del server');
            }
        });				
        }
    },
    onResize: function(w, h, oW, oH){
		this.callParent(arguments);
		var map = this.getMap();
		if (map){
			map.invalidateSize();
		}
	}
});
