Ext.define('APPDSS.store.Users', {
    extend: 'Ext.data.Store',
    alias: 'store.users',
    requires: [
        'APPDSS.model.User'
    ],
    remoteFilter: false,
    storeId: 'Users',
    autoLoad: false,
    model: 'APPDSS.model.User',
    sorters: [{
        property: 'username',
        direction: 'ASC'
    }] 
});