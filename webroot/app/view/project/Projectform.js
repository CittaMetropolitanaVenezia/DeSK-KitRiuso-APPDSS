var formatStore = Ext.create('Ext.data.Store', {
    fields: ['format'],
    data : [
        {"format":"image/png"},
        {"format":"image/jpg"}
    ]
});

Ext.define('APPDSS.view.project.Projectform', {
    extend: 'Ext.form.Panel',
    xtype: 'project-form',
    requires:[
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
		'Ext.form.field.HtmlEditor'
    ],
    title: 'Impostazioni Progetto',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    controller: 'projectform',
    autoScroll: true,
    header:{
        items: [{
            xtype: 'button',
            text: 'Indietro',
            handler: 'onBack'
        }]
    },
    config: {
        defaultValues: null
    },
    items: [
        {
            xtype: 'fieldset',
            style: {
                marginTop: '5px'
            },
            title: 'Generale',
            collapsed: false,
            collapsible: true,
           // allowBlank: false,
            listeners: {
                //add a * when allowBlank false
                beforeadd: function(fs, field) {
                    if (field.allowBlank === false)
                        field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                }
            },
            defaults: {
                labelWidth: 220,
                labelAlign: 'right'
            },
            defaultType: 'textfield',
            items: [
                { fieldLabel: 'Nome',  name: 'name', allowBlank: false, anchor: '70%'},
				{ fieldLabel: 'Titolo Legenda', name: 'legend_title', allowBlank: false, anchor: '70%'},
				{ fieldLabel: 'Titolo Descrizione', name: 'desc_title', allowBlank: false, anchor: '70%'},
                { fieldLabel: 'Descrizione', name: 'description', allowBlank: false, anchor: '70%', xtype: 'textarea'},
            ]
        },
        {
            xtype: 'fieldset',
            style: {
                marginTop: '5px'
            },
            title: 'WMS',
            collapsed: false,
            collapsible: true,
            listeners: {
                //add a * when allowBlank false
                beforeadd: function(fs, field) {
                    if (field.allowBlank === false)
                        field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                }
            },
            defaults: {
                labelWidth: 220,
                labelAlign: 'right'
            },
            defaultType: 'textfield',
            items: [
                { fieldLabel: 'Titolo WMS', name: 'wms_title', allowBlank: false, anchor: '70%'},
                { fieldLabel: 'Endpoint WMS', name: 'wms_endpoint', vtype: 'url', allowBlank: false, anchor: '70%'},
                { fieldLabel: 'Trasparenza WMS(1/0)', name: 'wms_transparent', xtype: 'numberfield', allowBlank: false, minValue: 0, maxValue: 1, anchor: '40%'},
                { fieldLabel: 'Layers WMS', name: 'wms_layers', allowBlank: false, anchor: '70%'},
                { fieldLabel: 'Attribution WMS', name: 'wms_attribution', anchor: '70%'},
                {   
                    xtype: 'combobox',
                    fieldLabel: 'Format WMS',
                    allowBlank: false,
                    name: 'wms_format',
                    store: formatStore,
                    queryMode: 'local',
                    displayField: 'format',
                    valueField: 'format',  
                },
                { fieldLabel: 'MaxZoom WMS', name: 'wms_maxzoom', xtype: 'numberfield', allowBlank: false, minValue: 1, maxValue: 18, anchor: '40%'},
            ] 
        }     
    ],
    buttons: [{
        text: 'Salva',
        formBind: true, //only enabled once the form is valid
        disabled: true,
        handler: 'submitForm'
    }],   
})
