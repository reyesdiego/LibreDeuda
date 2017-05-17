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
			const dialog = dialogsService.confirm('Modificar Conocimiento', `Atención, el cambio que está a punto de realizar, se aplicará a cada uno de Libre Deuda incluídos en el conocimiento\n¿Desea continuar?`);
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

		updatePlace(){
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

		forward(){
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

		disable(){
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

		enable(){
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
	}

	return BL;

}]);