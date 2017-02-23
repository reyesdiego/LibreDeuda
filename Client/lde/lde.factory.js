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

        getAllLde(page){
            const deferred = $q.defer();
            const insertUrl = `${configService.serverUrl}/lde/${page.skip}/${page.limit}`;
            $http.get(insertUrl).then(response => {
                console.log(response);
                response.data.data = this.retrieveLdes(response.data.data);
                deferred.resolve(response.data);
            }).catch(response => {
                console.log(response);
                deferred.reject(response.data);
            });
            return deferred.promise;
        }

        getLde(container){
            let deferred = $q.defer();
            const insertUrl = `${configService.serverUrl}/lde/${container}`;
            $http.get(insertUrl).then((response) => {
                if (response.statusText == 'OK'){
                    deferred.resolve(new Lde(response.data.data));
                } else {
                    deferred.reject(response.data);
                }
            }).catch((response) => {
                console.log(response);
                deferred.reject(response.data);
                //callback(response);
            });
            return deferred.promise;
        }
        //Consulta de lugares de devolución - Opcionalmente se puede pasar un ID para obtener un lugar específico
        getReturnPlaces(callback){
            const insertUrl = `${configService.serverUrl}/lde/lugar`;
            $http.get(insertUrl).then((response) => {
                callback(response.data)
            }).catch((response) => {
                callback(response.data)
            })
        }

    }

    return new ldeFactory();

}]);
