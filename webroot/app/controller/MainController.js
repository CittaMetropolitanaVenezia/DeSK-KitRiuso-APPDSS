/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('APPDSS.controller.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main', 
    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    },
    
    onLogout: function () {
        App.security.Firewall.logout();
    },
    hidePanels: function() {
        if(sessionStorage.getItem('admin') == 'false'){
            this.getView().tabBar.items.items[2].hide();
        }       
    },
	testFunction: function(){
		createProjectTab = this.getView().down('#create_project_tab');
		if(createProjectTab.getLayout().getActiveItem().id != 'polygonform'){
			Ext.GlobalEvents.fireEvent('resetShapes');
			
		}
	}
});
