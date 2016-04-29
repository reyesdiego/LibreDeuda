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
            return JSON.parse(localStorage.getItem(key))
        },
        deleteKey: function(key){
            localStorage.removeItem(key);
        }
    }

}]);