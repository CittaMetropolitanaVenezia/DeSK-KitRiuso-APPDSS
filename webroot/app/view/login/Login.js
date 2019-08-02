Ext.define('APPDSS.view.login.Login', {
    extend: 'Ext.window.Window',
    xtype: 'login',
    requires: [
        'APPDSS.controller.login.LoginController',
        'Ext.form.Panel'
    ],
    controller: 'login',
    bodyPadding: 10,
    title: 'APPDSS - Login',
    closable: false,
    resizable: false,
    draggable: false,
    autoShow: true,
    items: {
        xtype: 'form',
        reference: 'form',
        items: [{
            xtype: 'textfield',
            name: 'username',
            fieldLabel: 'Username',
            allowBlank: false
        }, {
            xtype: 'textfield',
            name: 'password',
            inputType: 'password',
            fieldLabel: 'Password',
            allowBlank: false
        }],
        buttons: [{
            text: 'Login',
            formBind: true,
            listeners: {
                click: 'onLoginClick'
            }
        }]
    }
});