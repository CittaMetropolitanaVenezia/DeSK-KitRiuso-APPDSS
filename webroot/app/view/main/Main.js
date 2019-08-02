/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('APPDSS.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',        
        'APPDSS.controller.MainController',
        'APPDSS.view.map.Map',
        'APPDSS.model.MainModel',
        'APPDSS.view.project.Projectform',
        'APPDSS.view.admin.Settings'
    ],
    plugins: 'viewport',
    controller: 'main',
    //layout: 'fit',
    viewModel: 'main',
    ui: 'navigation',
    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,
    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'fa-th-list',
        items: [],

    },
    tbar: [],
    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        },       
    },
    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },

    defaults: {
        bodyPadding: 20,
        tabConfig: {
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 120
                }
            },
        }
    },
    items: [{
        title: 'Progetti esistenti',
        xtype: 'panel',
        iconCls: 'fa-angle-double-right',
        layout:{
            type:'card'
        },
        itemId: 'projectTab',
        items: [{
            xtype: 'project-list'
        },{
            xtype: 'project-map'
        },{
            xtype: 'project-form'
        }],
		listeners: {
			activate: 'testFunction'
		}
    },{
        title: 'Crea progetto',		
        iconCls: 'fa-edit',
        
        items: [{
            xtype: 'new-project',
			id: 'create_project_tab',
            frame: true,            
        }],
    },{
        title: 'Amministrazione',
        xtype: 'panel',
        itemId: 'adminTab',
        iconCls: 'fa-cogs',
		listeners: {
			activate:{
				fn: 'testFunction',
				order: 'before'
			} 
		},
        items: [{
            xtype: 'user-list',
			layout: 'fit'
            
        },{
            xtype: 'tbspacer', height: '50px'
        },{
            xtype: 'admin-settings',
			layout: 'fit',
            frame: true,
            collapsible: true
        }],
    }],
    buttons:[{
        xtype: 'button',
        text: 'Logout',
        handler: 'onLogout'
    }],
    listeners: {
        render: 'hidePanels',
		
    }
   
});
