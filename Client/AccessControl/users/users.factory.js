/**
 * Created by kolesnikov-a on 07/12/2016.
 */
myApp.factory('usersFactory', ['User', '$http', '$q', 'APP_CONFIG', function(User, $http, $q, APP_CONFIG){

	var factory = {

		retrieveUsers: function(usersData){
			let usersArray = [];
			for (let user of usersData){
				user = new User(user);
				usersArray.push(user);
			}
			return usersArray;
		},

		getUsers: function(){
			const deferred = $q.defer();
			const url = `${APP_CONFIG.SERVER_URL}/rutaQueTraigaTodosLosUsuarios`;
			$http.get(url).then(response => {
				deferred.resolve(this.retrieveUsers(response.data.data));
			}, response => {
				deferred.reject(response.data);
			});
			return deferred.promise;

		}

	};

	return factory;

}]);