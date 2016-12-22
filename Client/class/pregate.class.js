/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.factory('PreGate', ['$http', '$q', 'configService', function($http, $q, configService){

	class PreGate {

		constructor(preGateData){
			this.CONTENEDOR = '';
			this.CERTIFICADO = '';
			this.FECHA = new Date();

			if (preGateData){
				angular.extend(this, preGateData);
			}
		}

		save(){
			const deferred = $q.defer();
			const inserturl = `${configService.serverUrl}/ctvp`;
			$http.post(inserturl, this).then(response => {
				if (response.data.status == 'OK'){
					deferred.resolve(response.data);
				} else {
					deferred.reject(response.data);
				}
			}, response => {
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		disable(){
			const deferred = $q.defer();
			const inserturl = `${configService.serverUrl}/rutaParaAnular`;
			$http.put(inserturl, this).then(response => {
				if (response.data.status == 'OK'){
					deferred.resolve(response.data);
				} else {
					deferred.reject(response.data);
				}
			}, response => {
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

	}

	return PreGate;

}]);