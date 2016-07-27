/**
 * Created by kolesnikov-a on 04/05/2016.
 */
myApp.service('Session', ['storageService', function(storageService){

    function Session (){
        if (storageService.getKey('token') !== null){
            this.reloadData(true);
        }
        if (storageService.getSessionKey('token') !== null){
            this.reloadData(false)
        }
    }

    Session.prototype = {
        reloadData: function(keep){
            var user = null;
            if (keep){
                user = storageService.getObject('user');
            } else {
                user = storageService.getSessionObject('user');
            }
            this.user = user.user;
            this.role = user.role;
            this.keep = keep;
        },
        setToken: function(token){
            if (this.keep){
                storageService.setKey('token', token);
            } else {
                storageService.setSessionKey('token', token);
            }
        },
        getToken: function(){
            if (this.keep){
                return storageService.getKey('token');
            } else {
                return storageService.getSessionKey('token');
            }
        },
        setData: function(user){
            this.user = user.USUARIO;
            this.role = user.role;
            this.keep = user.session;
            if (this.keep){
                storageService.setObject('user', user);
            } else {
                storageService.setSessionObject('user', user);
            }
        },
        getName: function(){
            return this.user;
        },
        isAuthenticated: function(){
            return (this.getToken() !== null);
        },
        isAuthorized: function(authorizedRoles){
            return (this.isAuthenticated() &&
            (authorizedRoles.indexOf(this.role) !== -1 || authorizedRoles.indexOf('*') !== -1));
        },
        logOut: function(){
            if (this.keep){
                storageService.deleteKey('user');
                storageService.deleteKey('token');
            } else {
                storageService.deleteSessionKey('user');
                storageService.deleteSessionKey('token');
            }
        }

    };

    return Session;

}]);