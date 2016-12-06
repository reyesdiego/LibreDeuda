/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.controller('registerCtrl', ['$scope', 'configService', 'Register', 'dialogsService', 'validatorService', function($scope, configService, Register, dialogsService, validatorService){

	$scope.user = Register;

	$scope.terminales = {
		BACTSSA: false,
		TERMINAL4: false,
		TRP: false
	};

	$scope.confirmPassword = '';
	$scope.validator = validatorService;

	$scope.getTerminals = function(){
		let terminalsArray = [];
		for (let terminal in $scope.terminales){
			let value = $scope.terminales[terminal];
			if (value) terminalsArray.push(value);
		}
		$scope.user.data.terminals = terminalsArray;
	};

	$scope.send = function(){
		if (!$scope.validator.validateCuit($scope.user.data.cuit)){
			dialogsService.notify('Registro', 'El CUIT ingresado no es válido.');
		} else if ($scope.user.data.password != $scope.confirmPassword){
			dialogsService.notify('Registro', 'Las contraseñas ingresadas no coinciden.');
			$scope.user.clave = '';
			$scope.confirmPassword = '';
		} else {
			console.log($scope.user);
			$scope.user.register().then((data) => {
				console.log(data);
			}, (error) => {
				console.log(error);
			})
		}

	}

}]);