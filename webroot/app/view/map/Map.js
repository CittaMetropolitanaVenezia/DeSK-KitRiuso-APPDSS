Ext.define('APPDSS.view.map.Map', {
    extend: 'Ext.panel.Panel',
    xtype: 'project-map',
    requires: [
        'APPDSS.ux.LeafletMapView',
    ],
    controller: 'mapcontroller',
    bodyPadding: 10,
    itemStyle: 'margin-top: 50px;',
    flex: 1,
    title: '<b>Dettaglio Progetto',
    //layout: 'column',
    closable: false,
    autoShow: true,
    header:{
        items: [{
            xtype: 'button',
            text: 'Indietro',
            handler: 'onBack'
        }]
    },
    items:[{
        xtype: 'leafletmapview',
        height: '100%',
        width: '100%'
    }]
});