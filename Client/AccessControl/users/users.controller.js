/**
 * Created by kolesnikov-a on 06/12/2016.
 */

myApp.controller('usersCtrl', ['$scope', 'usersFactory', function($scope, usersFactory){

	$scope.users = [];

	usersFactory.getUsers().then(users => {
		$scope.users = users;
	}, error => {

	});

}]);