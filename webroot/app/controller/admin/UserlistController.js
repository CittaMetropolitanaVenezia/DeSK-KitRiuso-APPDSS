/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('APPDSS.controller.admin.UserlistController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userlist',


    onNewUser: function(view){
        grid = view.up('grid');    
        rowEditing = grid.getPlugin('userRowEditor');

    rowEditing.cancelEdit();

    // Create a model instance
    var r = Ext.create('APPDSS.model.User', {
        username: '',
        password: '',
        name: '',
        surname: '',       
        email: '',
        active: true,
        admin: false
    });

    grid.getStore().insert(0, r);
    rowEditing.startEdit(0, 0);
    },
    switchUserList: function(view, cell, rowIndex, colIndex, e){
        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'key':
                me.sendNewPassword(view,rowIndex);
                break;
			case 'black':
				me.deleteUser(view,rowIndex);
				break;
        }
    },
    deleteUser: function(view,rowIndex){
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo utente?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){
                    if(record.data.is_admin){
                        Ext.Msg.confirm('Attenzione','Questo utente è un admin. Continuare?',function(confirm){
                            if (confirm == 'yes'){
                                //W.A. per selezionare il record in griglia ed evitare il bug
                                grid.mask('Eliminazione in corso..');
                                sm.select([record]);

                                store.remove(sm.getSelection());
                                record.erase({
                                    success: function(record,operation) {
                                        
                                        grid.unmask();
                                        Ext.Msg.alert('Attenzione', 'Utente eliminato correttamente');
                                    },
                                    failure: function(record,operation) {
                                        grid.unmask();
                                        Ext.Msg.alert('Errore', 'Impossibile eliminare l\'utente in questo momento');
                                        store.rejectChanges();
                                    }                        
                                });
                            }
                        });
                    }else{
                        //W.A. per selezionare il record in griglia ed evitare il bug
                        grid.mask('Eliminazione in corso..');
                        sm.select([record]);

                        store.remove(sm.getSelection());
                        record.erase({
                            success: function(record,operation) {
                                grid.unmask();
                                Ext.Msg.alert('Attenzione', 'Utente eliminato correttamente');
                            },
                            failure: function(record,operation) {
                                grid.unmask();
                                Ext.Msg.alert('Errore', 'Impossibile eliminare l\'utente in questo momento');
                                store.rejectChanges();
                            }                        
                        });
                    }
                    
                }
            });          
    },
    sendNewPassword: function(view,rowIndex){
         var me = this,
            grid = this.getView(),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
			 if (record.get('otp')) {
            var confirmMsg = "Visualizzare la password di questo utente?";
        }
        else {
            var confirmMsg = "Generare una nuova password per questo utente?"
        }
		Ext.Msg.confirm('Attenzione',confirmMsg,function(confirm){
            //se conferma positiva
            if (confirm == 'yes'){
                grid.mask('Generazione password...');
                //mando il parametro id
                var params = {
                    id: record.get('id')
                }
                Ext.Ajax.request({
					 url:  App.security.TokenStorage.getUrl()+'users/generatePassword',
                method: 'POST',
                params: params,
                success: function (response) {
                    grid.unmask();               
                    var result = Ext.decode(response.responseText);
					Ext.Msg.alert('Attenzione','La password di questo utente è<b>: '+result.data+'</b>');
                },   
                failure: function (response) {
                    grid.unmask();
                    Ext.Msg.alert('Errore', 'Errore del server');
                }
				});
            }
        });
    },
    loadData: function() {
        this.getView().getStore().load();
    }

});
