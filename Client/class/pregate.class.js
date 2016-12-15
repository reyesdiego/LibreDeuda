/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.factory('PreGate', ['$http', '$q', 'configService', function($http, $q, configService){

	class PreGate {

		constructor(preGateData){
			this.CONTENEDOR = '';
			this.CERTIFICADO = '';
			this.FECHA = '';

			if (preGateData){
				angular.extend(this, preGateData);
			}
		}

	}

	return PreGate;

}]);