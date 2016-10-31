/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.controller('registerCtrl', ['$scope', 'configService', 'Register', 'dialogsService', function($scope, configService, Register, dialogsService){

	$scope.user = Register;

	$scope.terminales = {
		bactssa: false,
		terminal4: false,
		trp: false
	};

	$scope.confirmPassword = '';

	$scope.getTerminals = function(){
		let terminalsArray = [];
		for (let terminal in $scope.terminales){
			let value = $scope.terminales[terminal];
			if (value) terminalsArray.push(value);
		}
		$scope.user.data.terminales = terminalsArray;
	};

	$scope.send = function(){
		if ($scope.user.data.clave === $scope.confirmPassword){
			console.log($scope.user);
			$scope.user.register().then((data) => {
				console.log(data);
			}, (error) => {
				console.log(error);
			})
		} else {
			dialogsService.notify('Registro', 'Las contraseñas ingresadas no coinciden.');
			$scope.user.clave = '';
			$scope.confirmPassword = '';
		}


	}

}]);