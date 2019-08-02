/**
 * This view is an example list of people.
 */
Ext.define('APPDSS.view.project.Projectlist', {
    extend: 'Ext.grid.Panel',
    xtype: 'project-list',

    requires: [
        'Ext.form.field.Checkbox',
        'APPDSS.store.Projects'
    ],
    layersformat : Ext.create('Ext.data.Store', {
        fields: ['format'],
                    data: [{'format' : 'image/png'}, 
                           {'format': 'image/jpg'}]
    }),
    title: '<b>Progetti',
    id: 'projectgrid',
    flex: 1,
    store: {
        type: 'projects'
    },
    controller: 'projectlist',
    columns: [
        { text: 'Nome',  dataIndex: 'name', flex: 1},
        { text: 'Descrizione', dataIndex: 'description', flex: 1}, 
        { text: 'Titolo WMS', dataIndex: 'wms_title', flex: 1},
        { text: 'Endpoint WMS', dataIndex: 'wms_endpoint', flex: 1},
        { text: 'Trasparenza WMS', dataIndex: 'wms_transparent', flex: 1,
            renderer: function(value){
                if(value === true){
                    return 1;
                }else{
                    return 0;
                }
            }},
        { text: 'Layers WMS', dataIndex: 'wms_layers', flex: 1},
        { text: 'Attribution WMS', dataIndex: 'wms_attribution', flex: 1},
        { text: 'Format WMS', dataIndex: 'wms_format', flex: 1},
        { text: 'MaxZoom WMS', dataIndex: 'wms_maxzoom', flex: 1},
        {
            xtype: 'actioncolumn',
            listeners: {
                click: 'switchProjectList'
            },
			//flex: 1,
            items: [{
                icon: 'resources/images/black-cross.png',
                tooltip: 'Cancella progetto',
                itemId: 'admin-projects-delete',
            },{
                icon: 'resources/images/map.png',
                tooltip: 'Visualizza progetto',
                itemId: 'admin-projects-map',
            },{
                icon: 'resources/images/edit.png',
                tooltip: 'Modifica progetto',
                itemId: 'admin-projects-edit'
            },{
				icon: 'resources/images/colors.png',
				tooltip: 'Thematizer',
				itemId: 'admin-projects-thematizer'
			}]
        }
    ],
    listeners: {
        activate: 'loadData'
    }
});
