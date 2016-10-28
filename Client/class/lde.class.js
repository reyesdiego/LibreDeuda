/**
 * Created by kolesnikov-a on 27/10/2016.
 */

myApp.factory('Lde', ['$http', '$q', 'configService', function($http, $q, configService){

	class Lde {

		constructor(){
			this.TERMINAL = '';
			this.BUQUE = '';
			this.VIAJE = '';
			this.CONTENEDOR = '';
			this.BL = '';
			this.FECHA_DEV = new Date();
			this.LUGAR_DEV = '';
			this.CUIT = '';
			this.VENCE = 0;
			this.ID_CLIENTE = '';
		}

		save() {
			const deferred = $q.defer();
			const insertUrl = configService.serverUrl + '/lde';

			$http.post(insertUrl, this).then(function(response){
				if (response.statusText == 'OK'){
					deferred.resolve(response.data);
				} else {
					deferred.reject(response.data);
				}
			}, function(response){
				deferred.reject(response.data);
			});

			return deferred.promise;

		}

	}

	return Lde;

}]);
