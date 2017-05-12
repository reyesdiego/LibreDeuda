/**
 * Created by kolesnikov-a on 12/05/2017.
 */
myApp.factory('BL', ['$http', '$q', 'configService', function($http, $q, configService){

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
	}

	return BL;

}]);