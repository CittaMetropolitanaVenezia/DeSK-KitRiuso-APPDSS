Ext.define('APPDSS.controller.admin.SettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.settings',
    submitForm: function(){     
        form = this.getView().getForm();
        panel = this.getView().up('#adminTab');
        params = form.getValues();
        if (form.isValid()) {
            panel.mask('Salvataggio in corso...')
            form.submit({
                url:  App.security.TokenStorage.getUrl()+'configuration/edit',
                params: params,
                success: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Attenzione', action.result.msg);
                },
                failure: function(form, action) {
                    panel.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
            });
        }
    },
    loadData: function(){
        form = this.getView().getForm();
        formView = this.getView();
        formView.mask('Caricamento impostazioni..');
        Ext.Ajax.request({
            url:  App.security.TokenStorage.getUrl()+'configuration/index',
            method: 'GET',
            success: function (response) {
                formView.unmask();
                var result = Ext.decode(response.responseText);
                data = result.data;
                form.setValues(data);
            },
            failure: function (response) {
                formView.unmask();
                var result = Ext.decode(response.responseText);
                Ext.Msg.alert('Errore', 'Errore del server');
            }
        })
    }
});