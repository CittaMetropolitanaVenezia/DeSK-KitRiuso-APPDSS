Ext.define('App.security.Firewall', {
    singleton: true,
    requires: [
        'App.security.TokenStorage'
    ],
    isLoggedIn: function() {
        return null !== App.security.TokenStorage.retrieve();
    },
    login: function(username, password) {
        var deferred = new Ext.Deferred();
        Ext.Ajax.request({
            url: App.security.TokenStorage.getUrl()+'users/login',
            method: 'POST',
            params: {
                'username': username,
                'password': password
            },
            success: function (response) {
				//Ext.Ajax._timeout = 600000;
                var data = Ext.decode(response.responseText);
				
                if (data.token) {
                    App.security.TokenStorage.save(data.token);
                    sessionStorage.setItem('admin', data.admin);
                    deferred.resolve(data, response);
                } else {
                    deferred.resolve(data, response);
                }
            },

            failure: function (response) {
                var data = Ext.decode(response.responseText);
                App.security.TokenStorage.clear();
                deferred.reject(data, response);
                Ext.Msg.alert('Errore', 'Errore del server!');
            }
        });

        return deferred.promise;
    },

    logout: function() {
        App.security.TokenStorage.clear();
        localStorage.removeItem('admin');
        window.location = App.security.TokenStorage.getUrl()+'users/logout';
    }
}, function () {
    Ext.Ajax.on('beforerequest', function(conn, options) {
        if (App.security.Firewall.isLoggedIn()) {
            options.headers = options.headers || {};
            options.headers['Authorization'] = 'Bearer ' + App.security.TokenStorage.retrieve();
        }
    });
	/*Ext.Ajax.on("requestexception", function(conn,options,b,c){
		if(options.getAllResponseHeaders().vary == 'Authorization'){
			Ext.Msg.alert('Attenzione','Token scaduto. Eseguire il login',function(confirm){
					//Ext.GlobalEvents.fireEvent('expiredToken');
					//App.security.Firewall.logout();
                });
            } 
	});*/
});