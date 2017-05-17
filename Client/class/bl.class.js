/**
 * Created by kolesnikov-a on 12/05/2017.
 */
myApp.factory('BL', ['$http', '$q', 'configService', 'dialogsService', function($http, $q, configService, dialogsService){

	class BL{
		constructor(ldeData){
			this.detallar = false;
			this.ldeList = [ldeData];

			this.BL = ldeData.BL;
			this.BUQUE = ldeData.BUQUE;
			this.VIAJE = ldeData.VIAJE;
		}

		addLde(ldeData){
			this.ldeList.push(ldeData)
		}

		confirmation(){
			const dialog = dialogsService.confirm('Modificar Conocimiento', `Atención, el cambio que está a punto de realizar, se aplicará a cada uno de los Libre Deuda incluídos en el conocimiento\n¿Desea continuar?`);
			return dialog.result;
		}

		deliver(){
			const deferred = $q.defer();
			this.confirmation().then(() => {
				console.log('hola');
				deferred.resolve();
			}).catch(() => {
				console.log('nada');
				deferred.reject();
			});
			return deferred.promise;
		}

		updatePlace(newPlace, fechaDev, email){
			const deferred = $q.defer();
			this.confirmation().then(() => {
				const insertUrl = `${configService.serverUrl}/lde/lugar`;
				let params = {
					BL: this.BL,
					LUGAR_DEV: newPlace,
					FECHA_DEV: fechaDev
				};
				if (email) params.EMAIL = email;
				$http.put(insertUrl, params).then((response) => {
					//console.log(response);
					console.log(response.data);
					deferred.resolve(response.data);
					//this.LUGAR_DEV = newPlace;
					//this.FECHA_DEV = fechaDev
				}).catch((response) => {
					//console.log(response);
					deferred.reject(response.data);
				});
			}).catch(() => {
				deferred.reject();
			});
			return deferred.promise;
		}

		forward(cuit, fechaDev){
			const deferred = $q.defer();
			this.confirmation().then(() => {
				const insertUrl = `${configService.serverUrl}/lde/forward`;
				const params = {
					BL: this.BL,
					CUIT: cuit,
					FECHA_DEV: fechaDev
				};

				$http.put(insertUrl, params).then((response) => {
					//console.log(response);
					console.log(response.data);
					deferred.resolve(response.data);
					//this.CUIT = cuit;
					//this.FECHA_DEV = fechaDev || this.FECHA_DEV;
				}).catch((response) => {
					//console.log(response);
					deferred.reject(response.data);
				});
			}).catch(() => {
				console.log('nada');
				deferred.reject();
			});
			return deferred.promise;
		}

		disable(){
			const deferred = $q.defer();
			this.confirmation().then(() => {
				const deferred = $q.defer();
				const insertUrl = `${configService.serverUrl}/lde/disable`;
				const params = {
					BL: this.BL
				};

				$http.put(insertUrl, params).then((response) => {
					console.log(response);
					if (response.data.status == 'OK'){
						//this.STATUS = response.data.data.STATUS.STATUS;
						deferred.resolve(response.data);
					} else {
						deferred.reject(response.data);
					}
				}).catch((response) => {
					//console.log(response);
					deferred.reject(response.data);
				});
			}).catch(() => {
				console.log('nada');
				deferred.reject();
			});
			return deferred.promise;
		}

		enable(){
			const deferred = $q.defer();
			this.confirmation().then(() => {
				const insertUrl = `${configService.serverUrl}/lde/enable`;
				const params = {
					BL: this.BL
				};

				$http.put(insertUrl, params).then((response) => {
					console.log(response);
					//this.STATUS = response.data.data.STATUS.STATUS;
					deferred.resolve(response.data);
				}).catch((response) => {
					//console.log(response);
					deferred.reject(response.data);
				});
			}).catch(() => {
				console.log('nada');
				deferred.reject();
			});
			return deferred.promise;
		}

		get cantidadLdes(){
			let cantidad = this.ldeList.length;
			if (this.ldeList.length > 1) {
				return cantidad += ' contenedores';
			} else {
				return cantidad += ' contenedor';
			}
		}
	}

	return BL;

}]);