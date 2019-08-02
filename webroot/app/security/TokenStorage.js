Ext.define('App.security.TokenStorage', {
    singleton: true,
    storageKey: 'json-web-token',
    baseUrl: '',

    clear: function () {
        sessionStorage.removeItem(this.storageKey);
    },

    retrieve: function() {
        return sessionStorage.getItem(this.storageKey);
    },

    save: function (token) {
        sessionStorage.setItem(this.storageKey, token);
    },
    getUrl: function() {
        return this.baseUrl;
    }
});