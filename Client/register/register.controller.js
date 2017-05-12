/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.controller('registerCtrl', ['$scope', 'Register', 'dialogsService', 'validatorService', function($scope, Register, dialogsService, validatorService){

	$scope.user = Register;

	$scope.confirmPassword = '';
	$scope.validator = validatorService;

	$scope.send = function(){
			if (!$scope.validator.validateCuit($scope.user.cuit)){
				dialogsService.notify('Registro', 'El CUIT ingresado no es válido.');
			} else if ($scope.user.password != $scope.confirmPassword){
				dialogsService.notify('Registro', 'Las contraseñas ingresadas no coinciden.');
				$scope.user.password = '';
				$scope.confirmPassword = '';
			} else {
				//console.log($scope.user);
				$scope.user.register().then((data) => {
					//console.log(data);
					dialogsService.notify('Registro', `Se ha enviado un mail a la cuenta de correo ${$scope.user.email}, ingrese para validar su usuario.`);
				}).catch((error) => {
					//console.log(error);
					if (!error.message) error.message = 'Se produjo un error al intentar crear el nuevo usuario.';
					dialogsService.error('Registro', error.message);
					/*if (error.code === 11000) {
						dialogsService.error('Registro', error.message);
					} else {
						dialogsService.error('Registro', 'Se produjo un error al intentar crear el nuevo usuario.');
					}*/
				});
			}
	};

}]);