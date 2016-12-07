/**
 * Created by kolesnikov-a on 07/12/2016.
 */
myApp.factory('User', ['$http', '$q', 'APP_CONFIG', function($http, $q, APP_CONFIG){

	class User {
		constructor(userData){
			if (userData) {
				angular.extend(this, userData);
			}
		}

		enable(){

		}

		disable(){

		}
	}

	return User;

}]);
