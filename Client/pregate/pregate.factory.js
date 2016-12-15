/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.factory('preGateFactory', ['$http', '$q', 'configService', function($http, $q, configService){

	class preGateFactory {

		getPreGates(){
			const deferred = $q.defer();
			const inserturl = `${configService.serverUrl}/ctvp`;

			return deferred.promise;
		}

	}

	return new preGateFactory;

}]);