/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('APPDSS.controller.project.ProjectlistController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.projectlist',
    switchProjectList: function(view, cell, rowIndex, colIndex, e){
        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];
        switch (action) {
            case 'map':               
                me.viewProject(view,rowIndex);
                break;
			case 'black':
				me.deleteProject(view,rowIndex);
                break;
            case 'edit':
                me.editProject(view,rowIndex);
                break;
			case 'colors':
				me.thematizeProject(view,rowIndex);
				break;
        }
    },
    deleteProject: function(view,rowIndex){
        var me = this,
        grid = view.up('grid'),
        store = grid.getStore(),
        sm = grid.getSelectionModel(),
        record = store.getAt(rowIndex);
        Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo progetto?',function(confirm){
            //se conferma postivia
            if (confirm == 'yes'){
                //W.A. per selezionare il record in griglia ed evitare il bug
                grid.mask('Eliminazione in corso..');
                sm.select([record]);
                store.remove(sm.getSelection());
                record.erase({
                    success: function(record,operation) {                                   
                        grid.unmask();
                        Ext.Msg.alert('Attenzione', 'Progetto eliminato correttamente');
                    },
                    failure: function(record,operation) {
                        grid.unmask();
                        Ext.Msg.alert('Errore', 'Impossibile eliminare il progetto in questo momento');
                        store.rejectChanges();
                    }                        
                });           
            }
        });    
    },
    loadData: function(){
        grid = Ext.getCmp('projectgrid');
        grid.getStore().load();
    },
    viewProject: function(view,rowIndex){
        id = rowIndex;
        //panel = this.getView().up('#projectTab');
        //panel.setActiveItem(1);
        Ext.GlobalEvents.fireEvent('openProjectMap', id);
    },
	thematizeProject: function(view,rowIndex){
		id = rowIndex;
		Ext.GlobalEvents.fireEvent('thematizeProject', id);
	},
    editProject: function(view,rowIndex){
        id = rowIndex;
        //panel = this.getView().up('#projectTab');
        //panel.setActiveItem(2);
        Ext.GlobalEvents.fireEvent('openProjectForm', id);
    }
});
