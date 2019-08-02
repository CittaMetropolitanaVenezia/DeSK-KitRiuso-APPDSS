Ext.define('APPDSS.model.User', {
    extend: 'Ext.data.Model',
    id: 'User',
    idProperty: 'id',
    proxy: {
        type: 'rest',
        url:  App.security.TokenStorage.getUrl()+'users',
        api: {
            create  :  App.security.TokenStorage.getUrl()+'users/add',
            read    :  App.security.TokenStorage.getUrl()+'users/index',
            update  :  App.security.TokenStorage.getUrl()+'users/edit',
            destroy :  App.security.TokenStorage.getUrl()+'users/delete'
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
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string'},
        { name: 'email', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'surname', type: 'string' },
        { name: 'active', type: 'boolean' },
        { name: 'is_admin', type: 'boolean'},
        { name: 'otp', type: 'boolean' },
        {
            name: 'created',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        },
        {
            name: 'modified',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        }
    ],
    validators: [
        {type: 'presence',  field: 'username', message:'campo obbligatorio'},
        {type: 'presence',  field: 'email', message:'campo obbligatorio'},
        {type: 'length',    field: 'username', min: 4, message: 'minimo  4 caratteri'},
        {type: 'presence',  field: 'name', message:'campo obbligatorio'},
        {type: 'presence',  field: 'surname', message:'campo obbligatorio'},
        {type: 'email', field: 'email', message:'email non valida'}
    ]
});