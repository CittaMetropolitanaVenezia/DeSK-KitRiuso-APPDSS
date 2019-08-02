/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('APPDSS.Application', {
    extend: 'Ext.app.Application',
    require: [
        'App.security.Firewall'
    ],

    name: 'APPDSS',
    stores: [
        'Users',
        'Projects',
        'Actions'
    ],

    launch: function () {
        // It's important to note that this type of application could use
        // any type of storage, i.e., Cookies, LocalStorage, etc.
        var token;

        // Check to see the current value of the localStorage key
        token = App.security.TokenStorage.retrieve();

        // This ternary operator determines the value of the TutorialLoggedIn key.
        // If TutorialLoggedIn isn't true, we display the login window,
        // otherwise, we display the main view
        Ext.create({
            xtype: token ? 'app-main' : 'login'
        });

    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});