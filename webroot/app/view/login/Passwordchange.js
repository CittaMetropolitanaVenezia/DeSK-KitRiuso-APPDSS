Ext.define('APPDSS.view.login.Passwordchange', {
    extend: 'Ext.window.Window',
    xtype: 'psw-change',
    requires: [
        'APPDSS.controller.login.LoginController',
        'Ext.form.Panel'
    ],
    controller: 'login',
    bodyPadding: 10,
    title: 'APPDSS - Cambia Password',
    closable: false,
    resizable: false,
    draggable: false,
    autoShow: true,
    items: {
        xtype: 'form',
        reference: 'form',
        items: [{
            xtype: 'textfield',
            name: 'new_psw',
            fieldLabel: 'Password',
            inputType: 'password',
            allowBlank: false
        }, {
            xtype: 'textfield',
            name: 'confirm_psw',
            inputType: 'password',
            fieldLabel: 'Conferma password',
            allowBlank: false
        }],
        buttons: [{
            text: 'Cambia password',
            formBind: true,
            listeners: {
                click: 'onPasswordChange'
            }
        }]
    }
});