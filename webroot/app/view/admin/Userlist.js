/**
 * This view is an example list of people.
 */
Ext.define('APPDSS.view.admin.Userlist', {
    extend: 'Ext.grid.Panel',
    xtype: 'user-list',

    requires: [
        'APPDSS.store.Users',
        'Ext.form.field.Checkbox',
        'Ext.grid.plugin.RowEditing'
    ],
    id: 'usergrid',
    title: '<b>Utenti',
    store: {
        type: 'users',
        queryMode: 'local'
    },
    controller: 'userlist',
    selModel: 'rowmodel',
    flex: 1,
    plugins: {
        ptype: 'rowediting',
        pluginId: 'userRowEditor',
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
                    if (cls[i].dataIndex == 'username') {
                        if (context.record.get('username') != "") {
                            cls[i].getEditor().setRawValue(context.record.get('username'));
                            cls[i].getEditor().setRawValue(context.record.get('name'));
                            cls[i].getEditor().setRawValue(context.record.get('surname'));
                            cls[i].getEditor().setRawValue(context.record.get('email'));
                            cls[i].getEditor().setRawValue(context.record.get('active'));
                            cls[i].getEditor().setRawValue(context.record.get('admin'));
                        }
                    }

                }
            },
            validateedit: function(editor, e, eOpts){
            },

            edit: function(editor, e) {
                e.grid.mask('Salvataggio..');
                e.record.save({                   
                    success: function(record,operation) {
                        var response = Ext.decode(operation._response.responseText);
                        e.grid.unmask();
                        if(response.result.success === true){
                            if (typeof e.record.get('id') === 'number') {
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',response.result.data.id);
                                Ext.Msg.alert('Successo','Utente creato correttamente!La password d\'accesso è: <b>'+response.result.data.password+'</b>');
                            }
                            //committo sulla griglia
                            e.record.commit();
                        }else{
                            Ext.Msg.alert('Attenzione', response.result.msg);
                        }
                       
                    },
                    failure: function(record,operation) {                
                        e.grid.unmask();
                        var response = Ext.decode(operation._response.responseText);
                        Ext.Msg.alert('Errore', response.result.msg);
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
        { text: 'username', dataIndex: 'username',flex: 1,  editor: {
            xtype: 'textfield',
            allowBlank: false,
            minLength: 4,
            msgTarget: 'under',
            blankText: 'Campo obbligatorio',
            invalidText: 'Almeno 4 caratteri',
            flex: 1
           
        }},
        { text: 'Nome',  dataIndex: 'name',flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false,
            msgTarget: 'under',
            blankText: 'Campo obbligatorio',
            flex: 1
            
        }},
        { text: 'Cognome', dataIndex: 'surname',flex: 1, 
        editor: {
            xtype: 'textfield',
            allowBlank: false,
            msgTarget: 'under',
            blankText: 'Campo obbligatorio',
            flex: 1
           
        }},
        { text: 'Email', dataIndex: 'email', flex: 1,
        editor: {
            vtype: 'email',
            allowBlank: false,
            msgTarget: 'under',
            blankText: 'Campo obbligatorio',
            vtypeText: 'Email non valida',
            flex: 1       
        }},
        { 
            text: 'Attivo', flex: 1, 
            renderer: function(value){
                if(value){
                    return '<img src="https://cdn-images-1.medium.com/max/1200/1*nZ9VwHTLxAfNCuCjYAkajg.png"style="width:20px;height:20px">';
                }else{
                    return '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Location_dot_red.svg/1024px-Location_dot_red.svg.png" style="width:18px;height:18px">';
                }
            },
            width: 60,
            draggable: false,
            sortable: false,
            menuDisabled: true,
            dataIndex: 'active',
            editor: {
                xtype: 'checkbox',
                cls: 'x-grid-checkheader-editor',
                msgTarget: 'under',
                flex: 1
            } 
        },{ 
            text: 'Admin', dataIndex: 'is_admin',flex: 1, editor: {
                xtype: 'checkbox',
                cls: 'x-grid-checkheader-editor',
                msgTarget: 'under',
                flex: 1
            },
            renderer: function(value){
                if(value){
                    return '<img src="https://cdn-images-1.medium.com/max/1200/1*nZ9VwHTLxAfNCuCjYAkajg.png"style="width:20px;height:20px">';
                }else{
                    return '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Location_dot_red.svg/1024px-Location_dot_red.svg.png" style="width:18px;height:18px">';
                }
            }, 
        },{
            xtype: 'actioncolumn',
            listeners: {
                click: 'switchUserList'
            },
            flex: 1,
            items: [{
                icon: 'resources/images/black-cross.png',
                tooltip: 'Cancella utente',
                itemId: 'admin-users-delete',
            },{
                icon: 'resources/images/key.png',
                tooltip: 'Invia password', 
                itemId: 'admin-users-sendPassword' //se otp a true invio quella generata primo giro -> se opt a false rigenero una nuova , inserisco quella nuova su tutti e due i campi e metto otp a true
            },]
        }
    ],
    tools: [{
        type: 'plus',
        tooltip: 'Aggiungi utente',
        listeners:{ 
            click: 'onNewUser'
        }
        }],
    listeners: {
        render: 'loadData'
    }
});
