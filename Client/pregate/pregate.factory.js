/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.factory('preGateFactory', ['$http', '$q', 'configService', 'PreGate', function($http, $q, configService, PreGate){

	class preGateFactory {

		getPreGates(){
			const deferred = $q.defer();
			const inserturl = `${configService.serverUrl}/ctvp`;
			$http.get(inserturl).then(response => {
				if (response.data.status == 'OK'){
					let preGates = [];
					for (let preGateData of response.data.data){
						preGateData = new PreGate(preGateData);
						preGates.push(preGateData);
					}
					deferred.resolve(preGates);
				} else {
					deferred.reject(response.data);
				}
			}).catch(response => {
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		getPreGate(container){
			const deferred = $q.defer();
			const inserturl = `${configService.serverUrl}/ctvp/${container}`;
			$http.get(inserturl).then(response => {
				if (response.data.status == 'OK'){
					deferred.resolve(new PreGate(response.data.data))
				} else {
					deferred.reject(response.data);
				}
			}).catch(response => {
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

	}

	return new preGateFactory;

}]);