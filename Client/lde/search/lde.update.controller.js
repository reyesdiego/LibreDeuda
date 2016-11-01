//Controlador para modal de actualización, para cuando se requieren datos adicionales antes de actualizar
myApp.controller('updateLdeCtrl', ['$scope', '$uibModalInstance', 'operation', 'ldeDate', 'places', 'validatorService', function($scope, $uibModalInstance, operation, ldeDate, places, validatorService){

	$scope.validCuit = false;

	//'invoice', 'place', 'forward'
	$scope.operation = operation;

	$scope.returnPlaces = places;

	//El model incluye todos los posibles datos necesarios para cualquier operacion de update dado que no son muchos
	//y así puedo usar el mismo controlador para cualquiera de ellas
	$scope.updateModel = {
		EMAIL_CLIENTE: '',
		LUGAR_DEV: '',
		FECHA_DEV: new Date(ldeDate),
		CUIT: '',
		ID_CLIENTE: ''
	};

	$scope.datePopUp = {
		opened: false,
		format: 'dd/MM/yyyy',
		options: {
			formatYear: 'yyyy',
			startingDay: 1,
			maxDate: new Date(ldeDate)
		}
	};

	$scope.openDate = function(){
		$scope.datePopUp.opened = true;
	};

	$scope.validateCuit = function(){
		$scope.validCuit = validatorService.validateCuit($scope.updateModel.CUIT);
	};

	$scope.save = function () {
		//Siempre devuelvo el model completo y luego cada método toma únicamente los datos que necesita
		if (operation == 'forward') {
			if (validatorService.validateCuit($scope.updateModel.CUIT)){
				$uibModalInstance.close($scope.updateModel);
			}
		} else {
			$uibModalInstance.close($scope.updateModel);
		}
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss();
	};

	$scope.formatPlace = function(model){
		for (let place of $scope.returnPlaces) {
			if (model === place._id) return place.NOMBRE
		}
	};


}]);
