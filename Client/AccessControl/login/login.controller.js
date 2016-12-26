/**
 * Created by kolesnikov-a on 06/12/2016.
 */

myApp.controller('loginCtrl', ['$rootScope', '$scope', '$state', 'dialogsService', 'Session',
	function($rootScope, $scope, $state, dialogsService, Session){

		$scope.user = Session;

		$scope.login = function(){
			$scope.user.login().then((result) => {
				if (result.statusText == 'OK'){
					//$rootScope.loggedUser = $scope.user.user;
					//storageService.setObject('user', $scope.user);
					$state.transitionTo('users');
				} else {
					dialogsService.error('Error', result.data.message);
				}
			}).catch(error => {
				let message = (error.data.message !== '') ? error.data.message : 'Error de inicio de sesión.';
				dialogsService.error('Error', message);
			});
		}

	}]);
