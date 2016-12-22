/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('ldeFactory', ['$http', 'configService', '$q', 'Lde', function($http, configService, $q, Lde){

    class ldeFactory {

        retrieveLdes(ldesData){
            let ldeArray = [];
            for (let lde of ldesData){
                ldeArray.push(new Lde(lde));
            }
            return ldeArray;
        }

        getAllLde(){
            const deferred = $q.defer();
            const insertUrl = `${configService.serverUrl}/lde`;
            $http.get(insertUrl).then(response => {
                console.log(response);
                deferred.resolve(this.retrieveLdes(response.data.data));
            }, response => {
                console.log(response);
                deferred.reject(response.data);
            });
            return deferred.promise;
        }

        getLde(container){
            let deferred = $q.defer();
            const insertUrl = `${configService.serverUrl}/lde/${container}`;
            $http.get(insertUrl).then((response) => {
                console.log(response);
                if (response.statusText == 'OK'){
                    deferred.resolve(response.data.data);
                } else {
                    deferred.reject(response.data);
                }
            }, (response) => {
                console.log(response);
                deferred.reject(response.data);
                //callback(response);
            });
            return deferred.promise;
        }
        //Consulta de lugares de devolución - Opcionalmente se puede pasar un ID para obtener un lugar específico
        getReturnPlaces(callback){
            var insertUrl = `${configService.serverUrl}/lde/lugar`;
            $http.get(insertUrl).then(function(response){
                callback(response.data)
            }, function(response){
                callback(response.data)
            })
        }

    }

    return new ldeFactory();

}]);
