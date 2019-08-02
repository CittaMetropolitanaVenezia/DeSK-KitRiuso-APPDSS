Ext.define('APPDSS.store.Actions', {
    extend: 'Ext.data.Store',
    alias: 'store.actions',
    requires: [
        'APPDSS.model.Action'
    ],
    remoteFilter: false,
    storeId: 'Actions',
    autoLoad: true,
    model: 'APPDSS.model.Action',
    sorters: [{
        property: 'description',
        direction: 'ASC'
    }],  
});