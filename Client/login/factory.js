/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.factory('loginFactory', ['$http', 'configService', 'storageService', function($http, configService, storageService){

    return {
        login: function(user, callback){
            var inserturl = configService.serverUrl + '/login';
            $http.post(inserturl, user).then(function(response){
                storageService.setKey('token', response.data);
                callback(response)
            }, function(response){
                callback(response);
            })
        },
        logout: function(){
            storageService.deleteKey('user');
            storageService.deleteKey('token');
        },
        isAuthenticated: function(){
            return (storageService.getKey('token') != null);
        },
        isAuthorized: function(authorizedRoles){
            return (this.isAuthenticated() &&
            (authorizedRoles.indexOf(storageService.getObject('user').role) !== -1 || authorizedRoles.indexOf('*') !== -1));
        }
    }

}])