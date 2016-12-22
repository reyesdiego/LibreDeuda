/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.controller('preGateCtrl', ['$scope', 'preGateFactory', 'dialogsService', function($scope, preGateFactory, dialogsService){

	$scope.search = '';

	$scope.panelPreGate = {
		type: 'panel-info',
		message: `Aguarde mientras se cargan los datos.`
	};

	$scope.preGates = [];

	$scope.getPreGatesData = function(){
		preGateFactory.getPreGates().then(data => {
			if (data.length > 0){
				$scope.preGates = data;
			} else {
				$scope.panelPreGate = {
					type: 'panel-info',
					message: 'No se encontraron datos.'
				}
			}
		}, error => {
			let message = `Se ha producido un error al cargar los datos de pre-gates. ${error.message}`;
			dialogsService.error('Pre-Gates', message);
			$scope.panelPreGate = {
				type: 'panel-danger',
				message: message
			};
		});
	};

	$scope.disablePreGate = function(preGate){
		preGate.disable().then(data => {
			console.log(data);
			$scope.getPreGatesData();
		}, error => {
			dialogsService.error('Pre-Gates', `Se ha producido un error al tratar de procesar la operación. ${error.message}`);
		});
	};


}]);