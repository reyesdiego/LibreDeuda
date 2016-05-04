/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.factory('loginFactory', ['$http', 'configService', '$rootScope', 'AUTH_EVENTS', function($http, configService, $rootScope, AUTH_EVENTS){

    return {
        login: function(user, callback){
            var inserturl = configService.serverUrl + '/login';
            $http.post(inserturl, user).then(function(response){
                $rootScope.$broadcast(AUTH_EVENTS.loginSucces, response.data, user);
                //storageService.setKey('token', response.data);
                callback(response)
            }, function(response){
                callback(response);
            })
        }
    }

}])