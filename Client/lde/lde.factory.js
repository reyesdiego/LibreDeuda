/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('ldeFactory', ['$http', 'configService', '$q', 'Lde', 'BL', function($http, configService, $q, Lde, BL){

    class ldeFactory {

        retrieveLdes(ldesData){
            let blContainer = {};
            let ldeArray = [];
            let blArray = [];
            for (let lde of ldesData){
                let ldeObject = new Lde(lde);
                if (blContainer[lde.BL]){
                    blContainer[lde.BL].addLde(ldeObject)
                } else {
                    blContainer[lde.BL] = new BL(ldeObject)
                }
                ldeArray.push(ldeObject);
            }
            for (let blCode in blContainer){
                if (blContainer.hasOwnProperty(blCode)) blArray.push(blContainer[blCode]);
            }

            return {
                ldeArray: ldeArray,
                blArray: blArray
			};
        }

        getAllLde(page, order){
            const deferred = $q.defer();
            const insertUrl = `${configService.serverUrl}/lde/${page.skip}/${page.limit}`;

			let params = '';
            if (order && order.field != ''){
                params = {};
                params.order = {};
                params.order[order.field] = (order.reverse ? -1 : 1);
            }

            $http.get(insertUrl, { params: params }).then(response => {
                //console.log(response);
                response.data.data = this.retrieveLdes(response.data.data);
                deferred.resolve(response.data);
            }).catch(response => {
                //console.log(response);
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
                //console.log(response);
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
