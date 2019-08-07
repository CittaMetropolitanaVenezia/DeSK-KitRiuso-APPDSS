Ext.define('APPDSS.controller.login.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',
    onLoginClick: function() {
        this.getView().mask('Effettuando il login..');
        var data = this.getView().down('form').getValues();
        App.security.Firewall.login(data.username, data.password).then(function(response) {
            this.getView().unmask();
            if(response.token){
                this.getView().destroy();
                var otp = response.otp;
                if(!otp){
                    Ext.create({
                        xtype: 'app-main'
                    });
                }else{
                    Ext.create({
                        xtype: 'psw-change'
                    });
                }   
            }else{
                Ext.Msg.alert('Attenzione', 'Dati inseriti non validi');
            }           
         
            
        }.bind(this), function(data) {
            this.getView().unmask();
            Ext.Msg.alert('Errore', data.message || 'Impossibile eseguire il login in questo momento.');
        });
    },
    onPasswordChange: function(){      
        var data = this.getView().down('form').getValues();
        var view = this.getView();
        if(data.new_psw === data.confirm_psw){
            this.getView().mask('Cambiando password...');
            Ext.Ajax.request({
                url:  App.security.TokenStorage.getUrl()+'users/changepsw',
                method: 'POST',
                params: {
                    'password': data.new_psw
                },
                success: function (response) {
                    Ext.Msg.alert('Attenzione', 'Password cambiata correttamente! Eseguo il login..');
                    view.unmask();
                    view.destroy();
                    Ext.create({
                        xtype: 'app-main'
                    });               
                },
                failure: function (response) {
                    view.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server.');                  
                }
            });
        }else{
            Ext.Msg.alert('Attenzione', 'Le password non corrispondono.');
        }
        
    },
	onEnter : function(field, e) {
        if (e.getKey() == e.ENTER) {
            this.onLoginClick();
        }
    }
});