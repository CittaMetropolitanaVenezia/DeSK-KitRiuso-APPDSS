Ext.define('APPDSS.controller.project.NewprojectController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.newproject',
	listen: {
        global: {
			resetShapes: 'resetShapes',
			expiredToken: 'resetShapesNoConfirm'
        }
    },
    polygonShapeImport: function() {
        form = this.getView().down('#polygonform').getForm();
        panel = this.getView();
        params = {};
		if(form.isValid()) {
			form.submit({
            url:  App.security.TokenStorage.getUrl()+'projects/addPolygonShape',
            waitMsg: 'Caricamento shape in corso, l\'operazione potrebbe richiedere qualche minuto...',
			timeout: 300000,
            params: params,
            success: function(fp, o) {
                result = o.result;
				Ext.getCmp('polygonfield').fileInputEl.set({'multiple' : true});
                form.setValues({
                     project_id : result.data.project_id,
                     poly_table : result.data.polygonTable
                });
                panel.setActiveItem(1);
            },
            failure: function(a,res) {
                result = res.result;
				Ext.Msg.alert('Errore',res.result.msgError);
				Ext.getCmp('polygonfield').fileInputEl.set({'multiple' : true});
            }
        });
		}else{
			Ext.Msg.alert('Errore','Compilare tutti i campi');
		}
        
    },
    generalShapeImport: function() {
        polyForm = this.getView().down('#polygonform').getForm();
        actionsCombo = this.getView().down('#actioncombo');
        wizardField = this.getView().down('#wizardfield2');
        wizardMsg = wizardField.getValue();
        importBtn = this.getView().down('#importbutton');
        columnsCombo = this.getView().down('#columncombo');
        actionBtn = this.getView().down('#actionbutton');
        generalBtn = this.getView().down('#shapefield');
        data = polyForm.getValues();
        if(data.project_id && data.poly_table){
            form = this.getView().down('#shapeform').getForm();
			params = {
				'project_id' : data.project_id
			};
			if(form.isValid()){
				form.submit({
					url:  App.security.TokenStorage.getUrl()+'projects/addGeneralShape',
					waitMsg: 'Caricamento shape in corso, l\'operazione potrebbe richiedere qualche minuto...',
					timeout: 300000,
					params: params,
					success: function(fp, o) {
						Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
						result = o.result;
						column_names = result.data.columns;
						type = result.data.type;
						columnsCombo.getStore().add([new Ext.data.Record({
									column_name: 'Conteggio'
							   })]); 
						if(type == 'POLYGON' || type == 'MULTIPOLYGON'){
							columnsCombo.getStore().add([new Ext.data.Record({
									column_name: 'Area'
							   })]);
							columnsCombo.getStore().add([new Ext.data.Record({
									column_name: 'Perimetro'
							   })]); 							   
						}else if(type == 'LINESTRING' || type == 'MULTILINESTRING'){
							columnsCombo.getStore().add([new Ext.data.Record({
									column_name: 'Lunghezza'
							   })]); 
						}
						generalTable = result.data.tableName;
						polyForm.setValues({
							general_table : generalTable
						});
						data = [];
						for(i=0; i<column_names.length; i++){
						   if(column_names[i]['column_name'] != 'the_geom' && column_names[i]['column_name'] != 'gid'){
							   columnsCombo.getStore().add([new Ext.data.Record({
									column_name: column_names[i]['column_name']
							   })]);     
						   }       
						}
						generalBtn.hide();
						actionsCombo.show();
						importBtn.hide();
						columnsCombo.show();
						actionBtn.show();
						wizardField.setValue(wizardMsg+"<span style='color:green'>&#10003;</span>"+
							"<br><b>3.</b> Selezionare l'azione e la colonna desiderata, poi premere <b>ESEGUI</b>.");
					},
					failure: function(a,res) {
						Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
						result = res.result;
						Ext.Msg.alert('Errore',res.result.msgError);
						
					}
				});
			}else{
				Ext.Msg.alert('Errore', 'Caricare il file di shape!');
			}        
        }else{
            Ext.Msg.alert('Attenzione', 'Importare prima la Polygon Shape!');
        }
        
    },
    executeAction: function(){
        //ACTIONS
        panel = this.getView();		
		polyForm = this.getView().down('#polygonform').getForm();
		polyValues = polyForm.getValues();
		generalForm = this.getView().down('#shapeform').getForm();
		generalValues = generalForm.getValues();
		var valid = false;
		if(generalValues.columncombo != '' && generalValues.columncombo != 'Conteggio'){
			if(generalValues.actioncombo != ''){
				valid = true;
			}
		}else if(generalValues.columncombo == 'Conteggio'){
			valid = true;
		}
		if(valid){
			panel.mask('Elaborazione in corso, l\'operazione potrebbe richiedere alcuni minuti..');
			Ext.Ajax.request({
			url:  App.security.TokenStorage.getUrl()+'projects/actionSwitch',
						timeout: 800000,
						method: 'POST',
						params: {
							'poly_table': polyValues.poly_table,
							'general_table': polyValues.general_table,
							'action': generalValues.actioncombo,
							'column': generalValues.columncombo
						},
						success: function (response) {
							panel.unmask();
							result = Ext.decode(response.responseText);
							polyForm.setValues({
								wms_table : result.data.output_table								
							});
							Ext.GlobalEvents.fireEvent('thematizeNewProject', result.data.output_field);
							panel.setActiveItem(2);
						},   
						failure: function (response) {
							panel.unmask();
							Ext.Msg.alert('Errore','Errore del Server');
							
						}
					});
		}else{
			Ext.Msg.alert('Attenzione','Selezionare un\'azione e una colonna.');
		}
		
    },
	columnSelected: function(combo){
		actionsCombo = this.getView().down('#actioncombo');
		if(combo.getValue() == 'Conteggio'){
			actionsCombo.disable();
			actionsCombo.reset();
		}else{
			actionsCombo.enable();
		} 
	},
    resetShapes: function() {      
        polyForm = this.getView().down('#polygonform').getForm();
		mainPanel = this.getView().up('app-main');
        actionsCombo = this.getView().down('#actioncombo');
        importBtn = this.getView().down('#importbutton');
        columnsCombo = this.getView().down('#columncombo');
        wizardField1 = this.getView().down('#wizardfield1');
        generalBtn = this.getView().down('#shapefield');
        wizardField2 = this.getView().down('#wizardfield2');
        actionBtn = this.getView().down('#actionbutton');
        panel = this.getView();
        data = polyForm.getValues();
		 Ext.Msg.confirm('Attenzione','Tutti i progessi della creazione verranno cancellati, continuare?',function(confirm){
                if (confirm == 'yes'){      				
                     panel.mask('Annullamento in corso..');
					 Ext.Ajax.request({
						url:  App.security.TokenStorage.getUrl()+'projects/resetShapes',
						method: 'POST',
						timeout: 300000,
						params: {
							'poly_table': data.poly_table,
							'general_table': data.general_table,
							'wms_table': data.wms_table,
							'project_id': data.project_id
						},
						success: function (response) {
						  result = Ext.decode(response.responseText);
						  panel.unmask();
						  polyForm.reset();
						  actionsCombo.hide();
						  columnsCombo.hide();
						  actionBtn.hide();
						  wizardField1.reset();
						  wizardField2.reset();
						  generalBtn.show();
						  importBtn.show();
						  Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
						  Ext.getCmp('polygonfield').fileInputEl.set({'multiple' : true});
						  Ext.Msg.alert('Attenzione', result.msg);
						  panel.setActiveItem(0);
						},   
						failure: function (response) {
							panel.unmask();
							result = Ext.decode(response.responseText);
							Ext.Msg.alert('Errore', result.msg);
						}
					});
                }else{
					mainPanel.setActiveItem(1);
				}
            });            
           
    },
	resetShapesNoConfirm: function() {      
        polyForm = this.getView().down('#polygonform').getForm();
		mainPanel = this.getView().up('app-main');
        actionsCombo = this.getView().down('#actioncombo');
        importBtn = this.getView().down('#importbutton');
        columnsCombo = this.getView().down('#columncombo');
        wizardField1 = this.getView().down('#wizardfield1');
        generalBtn = this.getView().down('#shapefield');
        wizardField2 = this.getView().down('#wizardfield2');
        actionBtn = this.getView().down('#actionbutton');
        panel = this.getView();
        data = polyForm.getValues();        
					 Ext.Ajax.request({
						url:  App.security.TokenStorage.getUrl()+'projects/resetShapes',
						method: 'POST',
						params: {
							'poly_table': data.poly_table,
							'general_table': data.general_table,
							'wms_table': data.wms_table,
							'project_id': data.project_id
						},
						success: function (response) {
						},   
						failure: function (response) {
						}
					});          
    }
});