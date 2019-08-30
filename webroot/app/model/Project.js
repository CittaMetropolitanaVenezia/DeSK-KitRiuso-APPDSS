Ext.define('APPDSS.model.Project', {
    extend: 'Ext.data.Model',
    id: 'Project',
    idProperty: 'id',
    proxy: {
        type: 'rest',
        url:  App.security.TokenStorage.getUrl()+'projects',
        api: {
            create  :  App.security.TokenStorage.getUrl()+'projects/add',
            read    :  App.security.TokenStorage.getUrl()+'projects/index',
            update  :  App.security.TokenStorage.getUrl()+'projects/edit',
            destroy :  App.security.TokenStorage.getUrl()+'projects/delete'
        },
        headers: {
            'Authorization' : 'Bearer ' + App.security.TokenStorage.retrieve()
        },
        reader: {
            type: 'json',
            rootProperty: 'response.data'
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
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'wms_title', type: 'string' },
        { name: 'wms_endpoint', type: 'string' },
        { name: 'wms_attribution', type: 'string' },
        { name: 'wms_transparent', type: 'boolean' },
        { name: 'wms_format', type: 'string'},
        { name: 'wms_maxZoom', type: 'string' },
        { name: 'wms_layers', type: 'string' },
        { name: 'polygon_table', type: 'string'},
        { name: 'shape_table', type: 'string'},
        { name: 'wms_table', type: 'string'},
		{ name: 'desc_title', type: 'string'},
		{ name: 'legend_title', type: 'string'},
		{ name: 'wms_conf', type:'string'},
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
        {type: 'presence',  field: 'name', message:'campo obbligatorio'},
        {type: 'presence',  field: 'description', message:'campo obbligatorio'}
    ]
});