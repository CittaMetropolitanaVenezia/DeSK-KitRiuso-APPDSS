Ext.define('APPDSS.model.Action', {
    extend: 'Ext.data.Model',
    id: 'Action',
    idProperty: 'id',
    proxy: {
        type: 'rest',
        url:  App.security.TokenStorage.getUrl()+'actions',
        api: {
            create  :  App.security.TokenStorage.getUrl()+'actions/add',
            read    :  App.security.TokenStorage.getUrl()+'actions/index',
            update  :  App.security.TokenStorage.getUrl()+'actions/edit',
            destroy :  App.security.TokenStorage.getUrl()+'actions/delete'
        },
        headers: {
            'Authorization' : 'Bearer ' + App.security.TokenStorage.retrieve()
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
    },
    fields: [
        // id field
        {
            name: 'id',
            type: 'int',
            useNull : true
        },
        // simple values
        { name: 'code', type: 'string' },
        { name: 'description', type: 'string' }
    ],
});