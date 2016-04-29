/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('containersFactory', ['$http', 'configService', 'storageService', function($http, configService, storageService){

    var factory = {

        getContainers: function(callback){
            var insertUrl = configService.serverUrl + '/lde';
            $http.get(insertUrl).then(function(response){
                callback(response);
            }, function(response){
                console.log(response);
                callback(response);
            })
        },
        saveContainer: function(dataContainer, callback){
            dataContainer.DETAIL[0].TIMESTAMP = new Date();
            dataContainer.DETAIL[0].USER = storageService.getObject('user').name;
            console.log(dataContainer);
            var insertUrl = configService.serverUrl + '/lde';
            $http.post(insertUrl, dataContainer).then(function(response){
                callback(response);
            }, function(response){
                callback(response);
            })
        }

    };

    return factory;

}]);
