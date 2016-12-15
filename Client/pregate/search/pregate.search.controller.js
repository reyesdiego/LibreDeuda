/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.controller('preGateCtrl', ['$scope', 'preGateFactory', function($scope, preGateFactory){

	$scope.search = '';

	$scope.panelPreGate = {
		type: 'panel-info',
		message: `Aguarde mientras se cargan los datos.`
	};

	$scope.preGates = [];

	$scope.getPreGatesData = function(){

	};


}]);