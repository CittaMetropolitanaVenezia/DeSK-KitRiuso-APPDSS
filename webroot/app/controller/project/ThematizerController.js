Ext.define('APPDSS.controller.project.ThematizerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.thematizer',
    config: {
        project_id: null
    },
	listen: {
        global: {
            thematizeProject: 'thematizeProject',
			thematizeNewProject: 'thematizeNewProject'
        }
    },
    thematizeNewProject: function(outputField){
        var me = this;
		//backToProjBtn = this.getView().down('#themabackProjBtn');
		backToNewBtn = this.getView().down('#themabackBtn');
		wmsBtn = this.getView().down('#wmsBtn');
		pdfBtn = this.getView().down('#pdfBtn');
		endBtn = this.getView().down('#endBtn');
        panel = this.getView().up();
        form = this.getView().getForm();
        form.reset();
        grid = this.getView().down('grid');
        grid.getStore().removeAll();
        panel.setTitle('<b>Nuovo progetto - Thematizer</b>');
        data = panel.down('#polygonform').getValues();
        wms_table = data['wms_table'];
		labelCombo = this.getView().down('#labelcolumns');
		labelCombo.getStore().removeAll();
        form = this.getView().getForm();
        form.setValues({
            wms_table : wms_table,
			themacolumn: outputField
        });
        panel.mask('Caricamento..');       
        Ext.Ajax.request({
            url:  App.security.TokenStorage.getUrl()+'thematizer/index',
            method: 'POST',
            params: {
                'wms_table': wms_table,
				'project': false
            },
            success: function (response) {
                panel.unmask();
                var result = Ext.decode(response.responseText);
                column_names = result.data.columns;
                for(i=0; i<column_names.length; i++){
                    if(column_names[i]['column_name'] != 'the_geom' && column_names[i]['column_name'] != 'gid'){
                    columnsCombo.getStore().add([new Ext.data.Record({
                        column_name: column_names[i]['column_name']
                        })]); 
				    labelCombo.getStore().add([new Ext.data.Record({
                        column_name: column_names[i]['column_name']
                        })]); 
                    }       
                }
				labelCombo.getStore().add([new Ext.data.Record({
					column_name: 'nessuna'})]);
				//backToProjBtn.hide();
				backToNewBtn.show();
				wmsBtn.disable();
				pdfBtn.disable();
				endBtn.disable();
            },
            failure: function (response) {
                panel.unmask();
				//backToProjBtn.hide();
				backToNewBtn.show();
				wmsBtn.disable();
				pdfBtn.disable();
				endBtn.disable();
                var result = Ext.decode(response.responseText);
				Ext.Msg.alert('Errore','Errore del server');
            }
        });
    },
	thematizeProject: function(id){
		var me = this;
		//backToProjBtn = this.getView().down('#themabackProjBtn');
		backToNewBtn = this.getView().down('#themabackBtn');
		numberField = this.getView().down('#color_number');
		wmsBtn = this.getView().down('#wmsBtn');
		pdfBtn = this.getView().down('#pdfBtn');
		endBtn = this.getView().down('#endBtn');
		createProjectTab = this.getView().up('#create_project_tab').up();
		this.getView().up('app-main').down('#projectTab').tab.hide();
		this.getView().up('app-main').down('#adminTab').tab.hide();
		createProjectTab.setTitle('Modifica Progetto');		
		var store = Ext.getStore('Projects');
        var project = store.getAt(id).data;
		//TODO: Use Ext.decode(project.wms_conf) for thematizer data
        panel = this.getView().up();
		polyForm = panel.down('#polygonform').getForm();
		polyForm.reset();
        form = this.getView().getForm();
        form.reset();
        grid = this.getView().down('grid');
        grid.getStore().removeAll();
        panel.setTitle('<b>'+project.name+' - Thematizer</b>');
        wms_table = project.wms_table;
        //columnsCombo = this.getView().down('#themacolumns');
		labelCombo = this.getView().down('#labelcolumns');
		labelColorPicker = this.getView().down('#label_color');
		startColorPicker = this.getView().down('#start_color');
		endColorPicker = this.getView().down('#end_color');
		labelCombo.getStore().removeAll();
		layer_field = this.getView().down('#layer_name');
        form = this.getView().getForm();
        form.setValues({
            wms_table : wms_table
        });
		this.project_id = project.id;
        Ext.Ajax.request({
            url:  App.security.TokenStorage.getUrl()+'thematizer/index',
            method: 'POST',
            params: {
                'wms_table': wms_table,
				'project': true
            },
            success: function (response) {
                var result = Ext.decode(response.responseText);
                column_names = result.data.columns;
				classifications = result.data.classifications;
				labelcolumn = result.data.labelcol;
				themacolumn = result.data.themacol;
				labelcolor = result.data.labelcolor;
				layer_name = result.data.layername;
				classification = [];
				for(i=0; i<classifications.length; i++){
					if(i == 0){
						startColorPicker.setValue(classifications[i].color);
					}
					if(i == (classifications.length-1)){
						endColorPicker.setValue(classifications[i].color);
					}
					 classification[i] = new Ext.data.Record({
                            id: i,
                            value: classifications[i].value,
                            color: classifications[i].color,
                            legend: classifications[i].legend
                        });           
				}
				grid.getStore().add(classification);
                for(i=0; i<column_names.length; i++){
                    if(column_names[i]['column_name'] != 'the_geom' && column_names[i]['column_name'] != 'gid'){
				    labelCombo.getStore().add([new Ext.data.Record({
                        column_name: column_names[i]['column_name']
                        })]); 
                    }       
                }
				labelCombo.getStore().add([new Ext.data.Record({
					column_name: 'nessuna'})]);
				form.setValues({
					themacolumn: themacolumn
				});
				labelCombo.setValue(labelcolumn);
				if(labelcolumn == 'nessuna'){
					labelColorPicker.disable();
				}else{
					labelColorPicker.enable();
					labelColorPicker.setValue(labelcolor);
				}
				layer_field.setValue(layer_name);
				numberField.setValue(classifications.length);
				wmsBtn.enable();
				pdfBtn.enable();
				endBtn.enable();
				//backToProjBtn.show();
				backToNewBtn.hide();
				me.getView().up('app-main').setActiveItem(1);
				me.getView().up().setActiveItem(2);
            },
            failure: function (response) {
                var result = Ext.decode(response.responseText);
                Ext.Msg.alert('Errore','Errore del Server');
            }
        });		
	},
	saveThema: function(){
		var me = this;
        form = this.getView().getForm();		
        panel = this.getView().up();
		polyForm = panel.down('#polygonform').getForm();
		values = polyForm.getValues();
        grid = this.getView().down('grid');
        data = form.getValues();
		projectData = this.getView().up().down('#polygonform').getForm().getValues();
		endBtn = this.getView().down('#endBtn');
        classifications = [];
        i = 0;
        grid.getStore().each(function(record) {
            classifications[i] = record.data;
            i++;
        });
		if(form.isValid()){
			if(classifications && classifications.length > 0 ){
            panel.mask('Salvataggio...');
            form.submit({
                url:  App.security.TokenStorage.getUrl()+'thematizer/saveThema',
                params: {
                    'classifications': Ext.encode(classifications),
					'project_id': projectData.project_id != '' ? projectData.project_id : me.project_id,
					'poly_table': values.poly_table,
					'general_table': values.general_table
                },
                success: function(form, action) {
                    panel.unmask();
					result = action.result;
					endBtn.enable();
					Ext.Msg.alert('Attenzione',result.message);
                },
                failure: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', action.result.message);
                }
            });
			}else{
				Ext.Msg.alert('Attenzione', 'Non è presente nessuna classificazione.');
			} 
		}else{
			Ext.Msg.alert('Attenzione', 'Compilare tutti i campi necessari.');
		}
          
	},
    thematizerBack: function(){		
        panel = this.getView().up();
		polyForm = panel.down('#polygonform').getForm();
		data = polyForm.getValues();
		Ext.Ajax.request({
			 url:  App.security.TokenStorage.getUrl()+'thematizer/deleteWmsTable',
                method: 'POST',
                params: {
                    'wms_table' : data.wms_table
                },
                success: function (response) {
                    var result = Ext.decode(response.responseText);
					panel.setTitle('<b>Nuovo progetto</b>');
					polyForm.setValues({
						wms_table : ''
					});
					panel.setActiveItem(1);
                },   
                failure: function (response) {
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
		});
        
    },
	backToProjects: function(){
		panel = this.getView().up();
		panel.setActiveItem(0);
		mainPanel = this.getView().up('app-main');
		mainPanel.setActiveItem(0);
		Ext.getStore('Projects').load();
		createProjectTab = this.getView().up('#create_project_tab').up();
		createProjectTab.setTitle('Crea Progetto');
		this.getView().up('app-main').down('#projectTab').tab.show();
		this.getView().up('app-main').down('#adminTab').tab.show();
	},
    onNewClass: function(view){
        grid = view.up('grid');    
        rowEditing = grid.getPlugin('classifyRowEditor');
        rowEditing.cancelEdit();
        // Create a model instance
        var r = Ext.create('Ext.data.Model', {
            color: '',
            value: '',
            legend: ''
        });
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
    },
	displayValues: function(){
		var me = this;
        panel = me.getView().up();
        grid = this.getView().down('grid');
        data = this.getView().getForm().getValues();
        themacolumn = data.themacolumn;
		wms_table = data.wms_table;
		panel.mask('Operazione in corso..');
            Ext.Ajax.request({
                url:  App.security.TokenStorage.getUrl()+'thematizer/retrieveValues',
                method: 'POST',
                params: {
                    'themacolumn': themacolumn,
                    'wms_table' : wms_table
                },
                success: function (response) {
                    panel.unmask();
                    var values = [];
                    var result = Ext.decode(response.responseText);
                    for(i=0; i<result.response.data.length; i++){
                        values[i] = result.response.data[i][themacolumn.toLowerCase()];
                    }					
                    values = values.filter( function( item, index, inputArray ) {
                        return inputArray.indexOf(item) == index;
                    });
                    values.sort((a, b) => a - b);  
					var valueWindow = Ext.create('Ext.window.Window', {
						title: 'Elenco Valori',
						height: 250,
						width: 300,
						layout: 'fit',
						items: {  
							xtype: 'grid',
							border: false,
							columns: [{ text: 'Valori - '+values.length+' totali',  dataIndex: 'value',flex: 1,align: 'center', sortable: false}],             
							store: Ext.create('Ext.data.Store',{
								fields : ['value'],
								remoteFilter: false
							}), 
						}
					});
					classification = [];
					for(i=0; i<values.length; i++){
							classification[i] = new Ext.data.Record({
								id: i,
								value: values[i] != null ? values[i] : 0
							});           
					}
					valWinStore = valueWindow.down('grid').getStore();
					valWinStore.add(classification);
					valueWindow.show();
                },   
                failure: function (response) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
            });
	},
    classifyDataSwitch: function(){
        data = this.getView().getForm().getValues();
        panel = this.getView().up();
        if(data.themacolumn == ''){
            Ext.Msg.alert('Attenzione','Selezionare la colonna da classificare');
        }else{
            panel.mask('Classificazione in corso..');
            switch(data['color_number']){
                case "": this.classifyData();
                break;
                default: this.classifyTable();
            }
        }
    },
    classifyData: function(){
        var me = this;
        panel = me.getView().up();
        grid = this.getView().down('grid');
        data = this.getView().getForm().getValues();
		wmsBtn = this.getView().down('#wmsBtn');
		pdfBtn = this.getView().down('#pdfBtn');
        start_color = '#'+data['start_color'];
        end_color = '#'+data['end_color'];   
        themacolumn = data.themacolumn;
            grid.getStore().removeAll();
            Ext.Ajax.request({
                url:  App.security.TokenStorage.getUrl()+'thematizer/retrieveValues',
                method: 'POST',
                params: {
                    'themacolumn': themacolumn,
                    'wms_table' : data.wms_table
                },
                success: function (response) {
                    panel.unmask();
                    var values = [];
                    var result = Ext.decode(response.responseText);
                    for(i=0; i<result.response.data.length; i++){
                        values[i] = result.response.data[i][themacolumn.toLowerCase()];
                    }
					
                    values = values.filter( function( item, index, inputArray ) {
                        return inputArray.indexOf(item) == index;
                    });
                    values.sort((a, b) => a - b);        
                    start_rgb = me.hexToRgb(start_color);
                    end_rgb = me.hexToRgb(end_color);
                    start_color_string = "rgb("+start_rgb['r']+","+start_rgb['g']+","+start_rgb['b']+")";
                    end_color_string = "rgb("+end_rgb['r']+","+end_rgb['g']+","+end_rgb['b']+")";
                    palette = me.interpolateColors(start_color_string, end_color_string, values.length);     
                    classification = [];
					if(values.length < 21){
						for(i=0; i<values.length; i++){
							hexColor = "rgb("+palette[i][0]+","+palette[i][1]+","+palette[i][2]+")";
							classification[i] = new Ext.data.Record({
								id: i,
								value: values[i] != null ? values[i] : '0',
								color: me.parseColor(hexColor)['hex'],
								legend: values[i] != null ? values[i] : '0'
							});           
						}
					}else{
						for(i=0; i<21; i++){						
							hexColor = "rgb("+palette[i][0]+","+palette[i][1]+","+palette[i][2]+")";
							classification[i] = new Ext.data.Record({
								id: i,
								value: '',
								color: me.parseColor(hexColor)['hex'],
								legend: ''
							});           
						}
						Ext.Msg.alert('Attenzione', 'Il numero di record è oltre il limite, la classificazione è avvenuta per raggruppamento.');
					}
                    
                    grid.getStore().add(classification);
					wmsBtn.enable();
					pdfBtn.enable();
                },   
                failure: function (response) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
            });
    },
    classifyTable: function(){
        var me = this;
        grid = this.getView().down('grid');
		wmsBtn = this.getView().down('#wmsBtn');
		pdfBtn = this.getView().down('#pdfBtn');
        panel = me.getView().up();
        //recupero i dati
        data = this.getView().getForm().getValues();
        start_color = '#'+data['start_color'];
        end_color = '#'+data['end_color'];
        color_number = data['color_number'];
        themacolumn = data['themacolumn'];
        //converto i colori
        start_rgb = me.hexToRgb(start_color);
        end_rgb = me.hexToRgb(end_color);
        start_color_string = "rgb("+start_rgb['r']+","+start_rgb['g']+","+start_rgb['b']+")";
        end_color_string = "rgb("+end_rgb['r']+","+end_rgb['g']+","+end_rgb['b']+")";   
            grid.getStore().removeAll();
            Ext.Ajax.request({
                url:  App.security.TokenStorage.getUrl()+'thematizer/retrieveValues',
                method: 'POST',
                params: {
                    'themacolumn': themacolumn,
                    'wms_table' : data.wms_table
                },
                success: function (response) {
                    panel.unmask();
                    var values = [];
                    var result = Ext.decode(response.responseText);
                    for(i=0; i<result.response.data.length; i++){
                        values[i] = result.response.data[i][themacolumn];
                    }
                    values = values.filter( function( item, index, inputArray ) {
                        return inputArray.indexOf(item) == index;
                    });
                    values.sort((a, b) => a - b);           
                    palette = me.interpolateColors(start_color_string, end_color_string, color_number);        
                    classification = [];
                    for(i=0; i<color_number; i++){
                        hexColor = "rgb("+palette[i][0]+","+palette[i][1]+","+palette[i][2]+")";
                        classification[i] = new Ext.data.Record({
                            id: i,
                            value: '',
                            color: me.parseColor(hexColor)['hex'],
                            legend: ''
                        });           
                    }
                    grid.getStore().add(classification); 
					wmsBtn.enable();
					pdfBtn.enable();
                },   
                failure: function (response) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
            });
        
    },
    deleteClassification: function(view,rowIndex){
        grid = view.up('grid');
        store = grid.getStore();
        sm = grid.getSelectionModel();
        var selection = sm.getSelection()[0];
        if (selection) {
            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questa classificazione?',function(confirm){
                if (confirm == 'yes'){           
                    store.remove(selection);

                }
            });               
        }else{
            Ext.Msg.alert('Errore','Selezionare la riga da eliminare');
        }
    },
    shapeExport: function(){
        panel = this.getView().up();
        form = this.getView().getForm();
		values = form.getValues();
		origin = window.location.origin;
        panel.mask('Esportazione..');
		Ext.Ajax.request({
			url:  App.security.TokenStorage.getUrl()+'thematizer/shapeExport',
			params: {
				wms_table : values.wms_table,
				origin : origin
			},
            success: function(response) {
                panel.unmask();
				var result = Ext.decode(response.responseText);
                url = result.data;
                window.open(url);
            },
            failure: function(response) {
                panel.unmask();
                Ext.Msg.alert('Errore','Errore del Server');
            }
		});
    },
    generateWms: function(){
		var me = this;
        form = this.getView().getForm();	
		origin = window.location.origin;
        panel = this.getView().up();
        grid = this.getView().down('grid');
        data = form.getValues();
		projectData = this.getView().up().down('#polygonform').getForm().getValues();
		endBtn = this.getView().down('#endBtn');
        classifications = [];
        i = 0;
        grid.getStore().each(function(record) {
            classifications[i] = record.data;
            i++;
        });
		if(form.isValid()){
			if(classifications && classifications.length > 0 ){
            panel.mask('Creazione WMS...');
            form.submit({
                url:  App.security.TokenStorage.getUrl()+'thematizer/generateWms',
                params: {
                    'classifications': Ext.encode(classifications),
					'project_id': projectData.project_id != '' ? projectData.project_id : me.project_id,
					'origin' : origin
                },
                success: function(form, action) {
                    panel.unmask();
					result = action.result;
					endBtn.enable();
					Ext.Msg.alert('Attenzione',result.msg+'<br><b>Endpoint: </b>'+result.data.endpoint+'<br><b>Layers: </b>'+result.data.layers).removeCls('x-unselectable');
                },
                failure: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', action.result.msg);
                }
            });
			}else{
				Ext.Msg.alert('Attenzione', 'Non è presente nessuna classificazione.');
			} 
		}else{
			Ext.Msg.alert('Attenzione', 'Compilare tutti i campi necessari.');
		}
          
    },
	generatePdf: function(){
		var me = this;
		form = this.getView().getForm();
		panel = this.getView().up();
		endBtn = this.getView().down('#endBtn');
		origin = window.location.origin;
		projectData = this.getView().up().down('#polygonform').getForm().getValues();
		classifications = [];
        i = 0;
        grid.getStore().each(function(record) {
            classifications[i] = record.data;
            i++;
        });
		if(form.isValid()){
			if(classifications && classifications.length > 0){
            panel.mask('Creazione PDF...');
			newWindow = window.open('', '_blank');
            form.submit({
                url:  App.security.TokenStorage.getUrl()+'thematizer/generatePdf',
                params: {
                    'classifications': Ext.encode(classifications),
					'project_id': projectData.project_id != '' ? projectData.project_id : me.project_id,
					'origin': origin
                },
                success: function(form, action) {				
                    panel.unmask();
					endBtn.enable();
					result = action.result;
					filename = result.data;
					url = App.security.TokenStorage.getUrl()+filename;
					newWindow.location = url;
                },
                failure: function(form, action) {
                    panel.unmask();
					newWindow.close();
                    action.result.msg ? Ext.Msg.alert('Attenzione', action.result.msg) : Ext.Msg.alert('Errore', 'Errore del Server');
                }
            });
			}else{
				Ext.Msg.alert('Attenzione', 'Non è presente nessuna classificazione.');
			}
		}else{
			Ext.Msg.alert('Attenzione','Compilare tutti i campi necessari.');
		}
        
	},
	endThematizer: function(){
		var me = this;
		panel = this.getView().up();
		mainPanel = this.getView().up('app-main');

		actionsCombo = panel.down('#actioncombo');
        importBtn = panel.down('#importbutton');
        columnsCombo = panel.down('#columncombo');
		generalBtn = panel.down('#shapefield');
		actionBtn = panel.down('#actionbutton');
		polyForm = panel.down('#polygonform').getForm();
		generalForm = panel.down('#shapeform').getForm();
		values = polyForm.getValues();
		if(values.general_table != '' || values.poly_table != ''){
			Ext.Ajax.request({
				url:  App.security.TokenStorage.getUrl()+'thematizer/endThematizer',
				method: 'POST',
				params: {
					'poly_table': values.poly_table,
					'general_table': values.general_table,
					'project_id': values.project_id
				},
				success: function (response) {
					var result = Ext.decode(response.responseText);
					Ext.getStore('Projects').load();
					panel.setTitle('<b>Nuovo progetto </b>');
					createProjectTab = me.getView().up('#create_project_tab').up();
					createProjectTab.setTitle('Crea Progetto');
					me.getView().up('app-main').down('#projectTab').tab.show();
					me.getView().up('app-main').down('#adminTab').tab.show();
					polyForm.reset();
					generalForm.reset();
					Ext.Msg.alert('Attenzione', result.message);
					panel.setActiveItem(0);
					mainPanel.setActiveItem(0);
					Ext.getCmp('polygonfield').fileInputEl.set({'multiple' : true});
					Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
					actionsCombo.hide();
					columnsCombo.hide();
					actionBtn.hide();
					generalBtn.show();
					importBtn.show();
				},
				failure: function (response) {
					var result = Ext.decode(response.responseText);
					Ext.Msg.alert('Errore', result.message);
				}
			});
		}else{
			Ext.getStore('Projects').load();
			panel.setTitle('<b>Nuovo progetto</b>');
			createProjectTab = me.getView().up('#create_project_tab').up();
			createProjectTab.setTitle('Crea Progetto');
			this.getView().up('app-main').down('#projectTab').tab.show();
			this.getView().up('app-main').down('#adminTab').tab.show();
			panel.setActiveItem(0);
			mainPanel.setActiveItem(0);
		}
	},
    //HEX TO RGB
    hexToRgb: function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });    
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      },

      //PALETTE MAKER
      interpolateColor: function(color1, color2, factor) {
        if (arguments.length < 3) { 
            factor = 0.5; 
        }
        var result = color1.slice();
        for (var i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return result;
    },
    interpolateColors: function(color1, color2, steps) {
        var stepFactor = 1 / (steps - 1),
            interpolatedColorArray = [];
    
        color1 = color1.match(/\d+/g).map(Number);
        color2 = color2.match(/\d+/g).map(Number);
    
        for(var i = 0; i < steps; i++) {
            interpolatedColorArray.push(this.interpolateColor(color1, color2, stepFactor * i));
        }
    
        return interpolatedColorArray;
    },
    
    // RGB TO HEX
    parseColor: function(color) {
        var arr=[]; color.replace(/[\d+\.]+/g, function(v) { arr.push(parseFloat(v)); });
        return {
            hex:  arr.slice(0, 3).map(this.toHex).join("")
        };
    },
    toHex: function(int) {
        var hex = int.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
});