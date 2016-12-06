/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.service('storageService', [function(){

    return {
        setKey: function(key, value){
            localStorage.setItem(key, value);
        },
        getKey: function(key){
            return localStorage.getItem(key);
        },
        setObject: function(key, value){
            localStorage.setItem(key, JSON.stringify(value));
        },
        getObject: function(key){
            return JSON.parse(localStorage.getItem(key));
        },
        setSessionKey: function(key, value){
            sessionStorage.setItem(key, value);
        },
        getSessionKey: function(key){
            return sessionStorage.getItem(key);
        },
        setSessionObject: function(key, value){
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        getSessionObject: function(key){
            return JSON.parse(sessionStorage.getItem(key));
        },
        deleteKey: function(key){
            localStorage.removeItem(key);
        },
        deleteSessionKey: function(key){
            sessionStorage.removeItem(key);
        }

    }

}]);