/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('containersFactory', ['$http', 'configService', 'storageService', function($http, configService, storageService){

    var places = [
        {id: 0, name: 'Depósito 1'},
        {id: 1, name: 'Depósito 489'},
        {id: 2, name: 'Hangar 18'},
        {id: 3, name: 'Tu casa'}
    ]

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
            /*dataContainer.CLIENT[0].AUD_TIME = new Date();
            dataContainer.CLIENT[0].AUD_USER = storageService.getObject('user').name;
            dataContainer.RETURN_TO[0].AUD_TIME = new Date();
            dataContainer.RETURN_TO[0].AUD_USER = storageService.getObject('user').name;
            dataContainer.STATUS[0].AUD_TIME = new Date();
            dataContainer.STATUS[0].AUD_USER = storageService.getObject('user').name;
            console.log(dataContainer);*/
            var insertUrl = configService.serverUrl + '/lde';
            $http.post(insertUrl, dataContainer).then(function(response){
                callback(response);
            }, function(response){
                callback(response);
            })
        },
        getReturnPlaces: function(query, callback){
            var insertUrl = configService.serverUrl + '/????';
            //TODO llamada http para traer los lugares de devolución
            return places;
        }
    };

    return factory;

}]);
