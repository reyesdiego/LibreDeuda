/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('containersFactory', ['$http', 'configService', function($http, configService){

    var factory = {

        getContainers: function(callback){
            var insertUrl = configService.serverUrl + '/libre';
            $http.get(insertUrl).then(function(response){
                callback(response);
            }, function(response){
                console.log(response);
                callback(response);
            })
        }

    };

    return factory;

}]);
