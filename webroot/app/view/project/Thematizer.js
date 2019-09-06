Ext.define('override', {
    override: 'Ext.grid.RowEditor',
    afterRender: function() {
        var me = this,
            plugin = me.editingPlugin,
            grid = plugin.grid;
        //the FIX
        me.scroller = grid.view.getScrollable();
        me.callSuper(arguments);
        // The scrollingViewEl is the TableView which scrolls
        me.scrollingView = grid.lockable ? grid.normalGrid.view : grid.view;
        me.scrollingViewEl = me.scrollingView.el;
        me.scroller.on('scroll', me.onViewScroll, me);
        // Prevent from bubbling click events to the grid view
        me.mon(me.el, {
            click: Ext.emptyFn,
            stopPropagation: true
        });
        // Ensure that the editor width always matches the total header width
        me.mon(grid, 'resize', me.onGridResize, me);
        if (me.lockable) {
            grid.lockedGrid.view.on('resize', 'onGridResize', me);
        }
        me.el.swallowEvent([
            'keypress',
            'keydown'
        ]);
        me.initKeyNav();
        me.mon(plugin.view, {
            beforerefresh: me.onBeforeViewRefresh,
            refresh: me.onViewRefresh,
            itemremove: me.onViewItemRemove,
            scope: me
        });
        me.syncAllFieldWidths();
        if (me.floatingButtons) {
            me.body.dom.setAttribute('aria-owns', me.floatingButtons.id);
        }
    }
 
});
Ext.define('APPDSS.view.project.Thematizer', {
    extend: 'Ext.form.Panel',
    xtype: 'prjct-thema',
    requires:[
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.ux.colorpick.Field'
    ],
    //buttonAlign: 'left',
    controller: 'thematizer',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    config: {
        defaultValues: null
    },
    items: [{
        xtype: 'panel',
        layout: 'column',
        items:[{
            columnWidth: 0.3,
            fieldLabel: 'Tabella',
            xtype: 'textfield',
            name: 'wms_table',
			readOnly: true,
            allowBlank: false,
            margin: '10 0 10 10'
      },{
            xtype: 'textfield',
            columnWidth: 0.3,
            name: 'themacolumn',
            fieldLabel: 'Colonna classificazione',
			readOnly: true,
			allowBlank: false,
            margin: '10 0 10 10',
      },{
        xtype: 'numberfield',
        columnWidth: 0.3,
        id: 'color_number',
        name: 'color_number',
        fieldLabel: 'Numero raggruppamenti',
        autoEl: {
          tag: 'div',
          'data-qtip': 'Se lasciato vuoto la classificazione avverrà per valore, se definito la classificazione avverrà per raggruppamento. Più di 20 classificazioni causano problemi con il PDF.'
        },
        margin: '10 0 10 10',
        minValue: 1
    },{   
            fieldLabel: 'Colore iniziale', 
            columnWidth: 0.3,
            xtype: 'colorfield',
            value: '#00F9FF',
            name: 'start_color',
            id: 'start_color',
            margin: '10 0 10 10',
            listeners: {
                afterrender: function(cmp) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + cmp.getValue();
                        cmp.inputEl.dom.style.color = "#" + cmp.getValue();
                    }
                },
                change: function(cmp, nV) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + nV;
                        cmp.inputEl.dom.style.color = "#" + nV;
                    }
                }
            }                  
      },{
            xtype: 'colorfield',
            columnWidth: 0.3,
            id: 'end_color',
            value: '#1000FF',
            name: 'end_color',
            fieldLabel: 'Colore finale',   
            margin: '10 0 10 10',
            listeners: {
                afterrender: function(cmp) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + cmp.getValue();
                        cmp.inputEl.dom.style.color = "#" + cmp.getValue();
                    }
                },
                change: function(cmp, nV) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + nV;
                        cmp.inputEl.dom.style.color = "#" + nV;
                    }
                }
            }        
      },{
          fieldLabel: 'Trasparenza del layer',
          columnWidth: 0.3,
          labelAlign: 'top',
          name: 'wms_transp',
          xtype: 'slider',
          margin: '10 0 10 10',
          maxWidth: 200,
          value: 30,
          increment: 10,
          minValue: 0,
          maxValue: 100,
    },{
            xtype: 'combobox',
            columnWidth: 0.3,
            id: 'labelcolumns',
            name: 'labelcolumn',
            displayField: 'column_name',
            valueField: 'column_name',
            queryMode: 'local',
            fieldLabel: 'Colonna Label',
            store: Ext.create('Ext.data.Store',{
                fields : ['column_name']
            }),
            forceSelection: true,
			allowBlank: false,
            margin: '10 0 10 10',
			listeners: {
				select : 'columnSelected'
			}
      },{
            xtype: 'colorfield',
            columnWidth: 0.3,
            id: 'label_color',
            value: '#000000',
            name: 'label_color',
            fieldLabel: 'Colore label',   
            margin: '10 0 10 10',
            listeners: {
                afterrender: function(cmp) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + cmp.getValue();
                        cmp.inputEl.dom.style.color = "#" + cmp.getValue();
                    }
                },
                change: function(cmp, nV) {
                    if(cmp.inputEl && cmp.inputEl.dom) {
                        cmp.inputEl.dom.style.backgroundColor = "#" + nV;
                        cmp.inputEl.dom.style.color = "#" + nV;
                    }
                }
            }        
      },{
		  xtype: 'textfield',
		  columnWidth: 0.3,
		  id: 'layer_name',
		  name: 'layer_name',
		  fieldLabel: 'Nome layer',
		  allowBlank: false,
		  margin: '10 0 10 10',
	  }]
    },{
            xtype: 'grid',
            flex: 1,
            buttonAlign : 'left',
            margin: '10 0 0 0',
            id: 'classification_grid',
            scrollable: true,
            title: 'Classificazione',
            store: Ext.create('Ext.data.Store',{
                fields : ['id','color', 'value', 'legend'],
                remoteFilter: false,
                limit: 8
            }),
            selModel: 'rowmodel',
            plugins: {
                ptype: 'rowediting',
                pluginId: 'classifyRowEditor',
                clicksToEdit: 2,
                clicksToMoveEditor: 1,
                autoCancel: false,
                errorSummary: false,
                saveBtnText  : 'Salva',
                cancelBtnText: 'Annulla',
                listeners: {      
                    beforeedit: function(editor, context, eOpts) {
                        var cls = context.grid.columns;
                        for (var i=0; i< cls.length; i++) {
                            if (cls[i].dataIndex == 'color') {
                                if (context.record.get('color') != "") {
                                    cls[i].getEditor().setRawValue(context.record.get('color'));
                                    cls[i].getEditor().setRawValue(context.record.get('value'));
                                    cls[i].getEditor().setRawValue(context.record.get('legend'));
                                }
                            }
        
                        }
                    },
                    validateedit: function(editor, e, eOpts){
                    },
        
                    edit: function(editor, e) {
                        e.grid.mask('Salvataggio..');
                        e.record.set({
                            color: e.newValues.color,
                            value: e.newValues.value,
                            legend: e.newValues.legend
                        });
                        e.record.save({                   
                            success: function(a,b) {
                                Ext.Msg.alert('Attenzione','Classificazione salvata correttamente!');
                                e.grid.unmask();
                                e.record.commit();
                            },
                            failure: function(record,operation) {                
                                Ext.Msg.alert('Errore','Impossibile creare la classificazione.');
                                e.grid.unmask();
                            }
                        });
                    },
        
                    cancelEdit: function(rowEditing, context) {
                        // Canceling editing of a locally added, unsaved record: remove it
                        if (context.record.phantom) {
                            context.store.remove(context.record);
                        }
                    }
                }
            },
            columns: [
                { text: 'Colore', dataIndex: 'color',flex: 1,  editor: {
                    xtype: 'colorfield',
                    allowBlank: false,
                    blankText: 'Campo obbligatorio',
                    msgTarget: 'under',
                    flex: 1                  
                },
                renderer: function(val, metaData, record){
                    metaData.style = 'display:block; background-color:#' +val+';';
                    return val;
                }},
                { text: 'Valore',  dataIndex: 'value',flex: 1,
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    msgTarget: 'under',
                    blankText: 'Campo obbligatorio',
                    flex: 1            
                },
                renderer: function(value, metaData,record){
                    metaData.tdAttr = 'data-qtip="1|2|5 --> x = 1 o x = 2 o x = 5 <br> 1,2 --> 1 <= x <= 2 <br> 1,<2 --> 1 <= x < 2 <br> >1,<2 --> 1 < x < 2 <br> >1,2 --> 1 < x <= 2 <br> 1 --> x = 1 <br> <1 --> x < 1 <br> <= 1 --> x <= 1 <br> >1 --> x > 1 <br> >=1 --> x >= 1 <br> all --> tutte"'"';
                    return value;
                }
                },
                { text: 'Legenda', dataIndex: 'legend',flex: 1, 
				invalidText: 'ciao',
                editor: {
                    xtype: 'textfield',
					maxLength: 20,
                    allowBlank: false,
                    msgTarget: 'under',
                    blankText: 'Campo obbligatorio',					
					invalidText: 'La legenda non può superare i 20 caratteri',
                    flex: 1                   
                }}
            ],
            tools: [{
				type: 'search',
				tooltip: 'Visualizza valori',
				listeners:{
					click: 'displayValues'
				}
			},{
                type: 'plus',
                tooltip: 'Aggiungi classificazione',
                listeners:{ 
                    click: 'onNewClass'
                }
            },{
                type: 'delete',
                tooltip: 'Elimina selezionata',
                listeners:{
                    click: 'deleteClassification'
                }
            }],
            buttons: [{
				text: 'Classifica',
                handler: 'classifyDataSwitch'  				               
            },{
				text: 'Salva',
				handler: 'saveThema'
			},{
				text: 'Fine',
				handler: 'endThematizer',
				id: 'endBtn',
				disabled: true
			},'->',{
				text: 'Genera WMS',
                handler: 'generateWms',
				id: 'wmsBtn',
				disabled: true
            },{
				text:' Genera PDF',
				handler: 'generatePdf',
				id: 'pdfBtn',
				disabled: true
            },{
                text: 'Esporta in shape',
                handler: 'shapeExport'
            },{
				text: 'Indietro',
                handler: 'thematizerBack',
				id: 'themabackBtn'
			}/*,{
				text: 'Indietro',
				handler: 'backToProjects',
				id: 'themabackProjBtn',
				hidden: true
			}*/]          
        },    
    ],
    listeners: {
        //activate: 'loadThematizerData'
    } 
})
