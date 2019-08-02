Ext.define('APPDSS.controller.project.ProjectformController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.projectform',
    listen: {
        global: {
            openProjectForm: 'loadFormData'
        }
    },
    config:  {
        id : null
    },


    loadFormData: function(rowIndex){
        form = this.getView().getForm();
        panel = this.getView().up('#projectTab');
        var store = Ext.getStore('Projects');
        var project = store.getAt(rowIndex).data;
        this.id = project['id'];
        panel.mask('Caricamento..');
        Ext.Ajax.request({
            url:  App.security.TokenStorage.getUrl()+'projects/view',
            method: 'GET',
            params: {
                'id': this.id,
            },
            success: function (response) {
                panel.unmask();
                var result = Ext.decode(response.responseText);
                var data = result.data;
                if(data['wms_transparent'] === true){
                    data['wms_transparent'] = 1; 
                }else{
                    data['wms_transparent'] = 1; 
                }
                form.setValues(data);
            },

            failure: function (response) {
                panel.unmask();
                Ext.Msg.alert('Errore','Impossibile caricare i dati in questo momento')
            }
        });
        panel.setActiveItem(2);
    },
    onBack: function(){
        form = this.getView().getForm();
        form.reset();
        panel = this.getView().up('#projectTab');
        panel.setActiveItem(0);
    },
    submitForm: function(){     
        form = this.getView().getForm();
        panel = this.getView().up('#projectTab');
        if (form.isValid()) {
            panel.mask('Salvataggio in corso...')
            form.submit({
                url:  App.security.TokenStorage.getUrl()+'projects/edit',
                params: {
                    'id': this.id
                },
                success: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Attenzione', action.result.msg);
                    data = action.result.data;
                    if(data['wms_transparent'] === true){
                        data['wms_transparent'] = 1; 
                    }else{
                        data['wms_transparent'] = 1; 
                    }
                    form.setValues(data);
                },
                failure: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', action.result.msg);
                }
            });
        }
    }
});