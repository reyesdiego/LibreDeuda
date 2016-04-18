/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('containersFactory', ['$http', 'configService', function($http, configService){

    var factory = {

        getContainers: function(callback){
            var insertUrl = configService.serverUrl + '/libre';
            $http.get(insertUrl).then(function(data){
                callback(data);
            }, function(error){
                callback(error);
            })
        }

    };

    return factory;

}]);
