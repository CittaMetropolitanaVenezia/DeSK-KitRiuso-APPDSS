Ext.define('APPDSS.store.Projects', {
    extend: 'Ext.data.Store',
    alias: 'store.projects',
    requires: [
        'APPDSS.model.Project'
    ],
    remoteFilter: false,
    storeId: 'Projects',
    autoLoad: false,
    model: 'APPDSS.model.Project',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    /*data : [
        {id: 1, name: 'Progetto1',   description: 'test1', wms_title: 'Test1' , wms_endpoint : 'http://servizi.informcity.it/cgi-bin/mapserv?MAP=/home/gis/web/tests/sioweb/wms_genova_zo.map&mode=map' ,wms_attribution: '' , wms_transparent: true , wms_format: 'image/png' ,wms_maxZoom: 18 , wms_layers: 'zone_omogenee_genova', center_lat: 44.093, center_long:  8.517 },
        {id: 2, name: 'Progetto2',   description: 'test2', wms_title: 'Test2' , wms_endpoint : 'http://servizi.informcity.it/cgi-bin/mapserv?MAP=/home/gis/web/tests/sioweb/wms_milano_zo.map&mode=map' ,wms_attribution: '' , wms_transparent: true , wms_format: 'image/png' ,wms_maxZoom: 18 , wms_layers: 'zone_omogenee_milano', center_lat: 44.093, center_long:  8.517}
    ]*/
    
});