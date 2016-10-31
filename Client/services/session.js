/**
 * Created by kolesnikov-a on 04/05/2016.
 */
myApp.service('Session', ['$rootScope', 'storageService', '$http', 'configService', 'AUTH_EVENTS', '$q', function($rootScope, storageService, $http, configService, AUTH_EVENTS, $q){


    this.data = {
        USUARIO: '',
        CLAVE: '',
        keep: false,
        role: 'admin'
    };

    this.login = function(){
        const deferred = $q.defer();
        const inserturl = configService.serverUrl + '/login';

        $http.post(inserturl, this.data).then((response) => {
            $rootScope.$broadcast(AUTH_EVENTS.loginSucces);
            this.setData();
            this.setToken(response.data.data);
            deferred.resolve(response);
        }, function(response){
            deferred.reject(response);
        });
        return deferred.promise;
    };

    this.keepAlive = function(){
        const deferred = $q.defer();
        const inserturl = configService.serverUrl + '/login';

        $http.post(inserturl, this.data).then((response) => {
            this.setToken(response.data.data);
            deferred.resolve();
        }, (response) => {
            deferred.reject(response);
        });
        return deferred.promise;
     };

    this.reloadData = function(keep){
        let user = null;
        if (keep){
            user = storageService.getObject('user');
        } else {
            user = storageService.getSessionObject('user');
        }
        console.log(user);
        this.data.USUARIO = user.USUARIO;
        this.data.CLAVE = user.CLAVE;
        this.data.role = user.role;
        this.data.keep = keep;

    }

    this.setToken = function(token){
        if (this.data.keep){
            storageService.setKey('token', token);
        } else {
            storageService.setSessionKey('token', token);
        }
    }

    this.getToken = function(){
        if (this.data.keep){
            return storageService.getKey('token');
        } else {
            return storageService.getSessionKey('token');
        }
    }

    this.setData = function(){
        if (this.data.keep){
            storageService.setObject('user', this.data);
        } else {
            storageService.setSessionObject('user', this.data);
        }
    }

    this.getName = function(){
        return this.data.USUARIO;
    }

    this.isAuthenticated = function(){
        return (this.getToken() !== null);
    }

    this.isAuthorized = function(authorizedRoles){
        return (this.isAuthenticated() &&
        (authorizedRoles.indexOf(this.data.role) !== -1 || authorizedRoles.indexOf('*') !== -1));
    }

    this.logOut = function(){
        if (this.data.keep){
            storageService.deleteKey('user');
            storageService.deleteKey('token');
        } else {
            storageService.deleteSessionKey('user');
            storageService.deleteSessionKey('token');
        }
    }

    if (storageService.getKey('token') !== null){
        this.reloadData(true);
    }
    if (storageService.getSessionKey('token') !== null){
        this.reloadData(false)
    }

}]);