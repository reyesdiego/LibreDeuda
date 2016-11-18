/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.controller('newLdeCtrl', ['$scope', 'Lde', 'dialogsService', 'ldeFactory', 'configService', function($scope, Lde, dialogsService, ldeFactory, configService){

	$scope.newContainer = new Lde();
	$scope.statesContainers = configService.statusContainersAsArray();
	$scope.terminals = configService.terminalsArray;
	$scope.returnPlaces = [];

	ldeFactory.getReturnPlaces((data) => {
		$scope.returnPlaces = data.data
	});

	$scope.saveLde = function(){
		$scope.newContainer.save().then((data) => {
			console.log(data);
			dialogsService.notify('Nuevo contenedor', `Los datos se han guardado correctamente.\n${data.message || ''}`);
			$scope.newContainer = new Lde();
		}, (error) => {
			console.log(error);
			dialogsService.error('Contenedor', error.message);
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
		$scope.newContainer[field] = '';
	};

	$scope.formatStatus = function(model){
		for (let state of $scope.statesContainers) {
			if (model === state.id) return state.formatted
		}
	};

	$scope.formatPlace = function(model){
		for (let place of $scope.returnPlaces) {
			if (model === place._id) return place.NOMBRE
		}
	};


}]);