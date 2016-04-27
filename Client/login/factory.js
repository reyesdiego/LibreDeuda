/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.factory('loginFactory', ['$http', 'configService', function($http, configService){

    return {
        login: function(user, callback){
            var inserturl = configService.serverUrl + '/login';
            $http.post(inserturl, user).then(function(response){
                callback(response)
            }, function(response){
                callback(response);
            })
        }
    }

}])