/**
 * Created by kolesnikov-a on 15/12/2016.
 */

myApp.controller('newPreGateCtrl', ['$scope', 'PreGate', 'dialogsService', function($scope, PreGate, dialogsService){

	$scope.newPreGate = new PreGate();

	$scope.savePreGate = function(){
		$scope.newPreGate.save().then(data => {
			dialogsService.notify('Nuevo pre-gate', `Los datos se han guardado correctamente.\n${data.message || ''}`);
			$scope.$emit('updateData');
			$scope.newPreGate = new PreGate();
		}).catch(error => {
			dialogsService.error('Error', error.message);
		});
	};

	$scope.datePopUp = {
		opened: false,
		format: 'dd/MM/yyyy',
		options: {
			formatYear: 'yyyy',
			startingDay: 1
		}
	};

	$scope.openDate = function(){
		$scope.datePopUp.opened = true;
	};

	$scope.eraseField = function(field){
		$scope.newPreGate[field] = '';
	};


}]);