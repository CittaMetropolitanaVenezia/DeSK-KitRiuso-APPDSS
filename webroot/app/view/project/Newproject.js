Ext.define('APPDSS.view.project.Newproject', {
    extend: 'Ext.panel.Panel',
    xtype: 'new-project',
    requires: [
        'APPDSS.controller.project.NewprojectController',
        'Ext.form.Panel',
        'APPDSS.view.project.Thematizer'
    ],
    controller: 'newproject',
    frame: true,
    layout: {type: 'card'},  
    title: '<b>Nuovo progetto',
    
    animation : 'slide',
    closable: false,
    autoShow: true,  
    items:[{
        flex: 1,
        xtype: 'form',
        id: 'polygonform',
        buttonAlign : 'center',
        frame: true,
        items: [{
            id: 'wizardfield1',
            xtype: 'displayfield',
            value: "<b>CREAZIONE DI UN PROGETTO</b><br><b>1.</b> Caricare tramite apposito pulsante un fileshape di tipo <b>POLYGON/MULTIPOLYGON</b>,inserire i dati richiesti, poi premere <b>IMPORTA</b>;",
            frame: true ,               
        },{
                xtype: 'textfield',
                fieldLabel: 'Nome progetto',
                name: 'project_name',
                allowBlank: false,
                style: {
                    marginLeft: '200px',              
                },
            },{
				xtype: 'textfield',
				fieldLabel: 'Titolo legenda',
				name: 'legend_title',
				allowBlank: false,
				style: {
					marginLeft: '200px'
				}
			},{
				xtype: 'textfield',
				fieldLabel: 'Titolo descrizione',
				name: 'desc_title',
				allowBlank: false,
				style: {
					marginLeft: '200px'
				}
			},{
                xtype: 'textareafield',
                fieldLabel: 'Descrizione',
                grow: true,
                name: 'project_desc',
                allowBlank: false,
                style: {
                    marginLeft: '200px',              
                },
            },{
                xtype: 'restfileupload',
                allowBlank: false,
                style: {
                    marginLeft: '200px',              
                },
                id: 'polygonfield',
                accept: ['shp','shx','dbf'],
                name: 'shape[]',
                fieldLabel: 'FILE NECESSARI <b>SHP,SHX,DBF</b>',
                msgTarget: 'side',
                buttonText: 'Carica',
            },{
                xtype: 'hiddenfield',
                fieldLabel: 'ID Progetto',
                name: 'project_id'
            },{
                xtype: 'hiddenfield',
                name: 'poly_table'
            },{
                xtype: 'hiddenfield',
                name: 'general_table'
            },{
                xtype: 'hiddenfield',
                name: 'wms_table'
            },{
                xtype: 'button',
                text: 'Importa',
                margin: '0 0 0 410',
                handler: 'polygonShapeImport'
            }],
    },{
        xtype: 'form',
        flex: 1,
        id: 'shapeform',
        buttonAlign : 'center',
        frame: true,
        items: [{
                    xtype: 'displayfield',
                    id: 'wizardfield2',
                    value: "<b>CREAZIONE DI UN PROGETTO</b><br><b>1.</b> Caricare tramite apposito pulsante un fileshape di tipo <b>POLYGON/MULTIPOLYGON</b> in proiezione <b>32632</b>, inserire i dati richiesti, poi premere <b>IMPORTA</b>;",               
                },
                {
                    xtype: 'restfileupload',
                    accept: ['shp','shx','dbf'],
                    style: {
                        marginLeft: '200px',              
                    },
                    id: 'shapefield',
                    name: 'shape[]',
                    allowBlank: false,
                    fieldLabel: 'FILE NECESSARI <b>SHP,SHX,DBF</b>',
                    msgTarget: 'side',
                    buttonText: 'Carica',
                },{
                    xtype: 'combobox',
                    id: 'columncombo',
					name: 'columncombo',
                    displayField: 'column_name',
                    style: {
                        marginLeft: '200px',              
                    },
                    valueField: 'column_name',
                    queryMode: 'local',
                    fieldLabel: 'Campo',
                    hidden: true,
                    store: Ext.create(Ext.data.Store,{
                        fields : ['column_name']
                    }),
					listeners: {
						select : 'columnSelected'
					}
                },{
                    xtype: 'combobox',      
                    id: 'actioncombo',    
					name: 'actioncombo',
                    style: {
                        marginLeft: '200px',              
                    },
                    displayField: 'description',
                    valueField: 'description',
                    store: 'Actions',
					disabled: true,
                    queryMode: 'local',
                    fieldLabel: 'Azioni',
                    forceSelection: true,
                    editable: false,
                    hidden: true          
                }],
                buttons: [{
                    text: 'Importa',
                    id: 'importbutton',
                    //formBind: true,
                    listeners: {
                        click: 'generalShapeImport'
                    }
                },{
                    text: 'Esegui',
                    id: 'actionbutton',
                    hidden: true,
                    listeners: {
                        click: 'executeAction'
                    }
                },{
                    text: 'Annulla',
                    id: 'backbutton',
                    listeners: {
                        click: 'resetShapes'
                    }
                }],          
    },{
        xtype: 'prjct-thema',
        scrollable: true
    }],
 
});
