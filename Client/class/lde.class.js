/**
 * Created by kolesnikov-a on 27/10/2016.
 */

myApp.factory('Lde', ['$http', '$q', 'configService', function($http, $q, configService){

	class Lde {

		constructor(ldeData){
			this.ID = {};
			if (ldeData){
				angular.extend(this, ldeData)
			} else {
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
				this.EMAIL = '';
			}
		}

		save() {
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde`;

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

		disable(){
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde/disable`;
			const params = {
				CONTENEDOR: this.CONTENEDOR,
				ID_CLIENTE: this.ID_CLIENT,
				ID: this.ID.id
			};

			$http.put(insertUrl, params).then((response) => {
				console.log(response);
				if (response.data.status == 'OK'){
					this.STATUS = response.data.data.STATUS.STATUS;
					deferred.resolve(response.data);
				} else {
					deferred.reject(response.data);
				}
			}, (response) => {
				console.log(response);
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		enable(){
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde/enable`;
			const params = {
				CONTENEDOR: this.CONTENEDOR,
				ID_CLIENTE: this.ID_CLIENT,
				ID: this.ID.id
			};

			$http.put(insertUrl, params).then((response) => {
				console.log(response);
				this.STATUS = response.data.data.STATUS.STATUS;
				deferred.resolve(response.data);
			}, (response) => {
				console.log(response);
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		updatePlace(newPlace){
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde/lugar`;
			const params = {
				CONTENEDOR: this.CONTENEDOR,
				LUGAR_DEV: newPlace,
				ID_CLIENTE: this.ID_CLIENT,
				ID: this.ID.id
			};
			$http.put(insertUrl, params).then((response) => {
				console.log(response);
				deferred.resolve(response.data);
			}, (response) => {
				console.log(response);
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		forward(cuit, fechaDev){
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde/forward`;
			const params = {
				CONTENEDOR: this.CONTENEDOR,
				CUIT: cuit,
				FECHA_DEV: fechaDev
			};

			$http.put(insertUrl, params).then((response) => {
				console.log(response);
				deferred.resolve(response.data);
			}, (response) => {
				console.log(response);
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

		deliver(email){
			const deferred = $q.defer();
			const insertUrl = `${configService.serverUrl}/lde/invoice`;
			const params = {
				CONTENEDOR: this.CONTENEDOR,
				EMAIL_CLIENTE: email
			};

			$http.put(insertUrl, params).then((response) => {
				console.log(response);
				this.STATUS = response.data.data.STATUS.STATUS;
				deferred.resolve(response.data);
			}, (response) => {
				console.log(response);
				deferred.reject(response.data);
			});
			return deferred.promise;
		}

	}

	return Lde;

}]);
