/**
 * Created by kolesnikov-a on 07/12/2016.
 */
myApp.factory('usersFactory', ['User', '$http', '$q', 'APP_CONFIG', function(User, $http, $q, APP_CONFIG){

	class usersFactory {

		retrieveUsers(usersData){
			let usersArray = [];
			for (let user of usersData){
				user = new User(user);
				usersArray.push(user);
			}
			return usersArray;
		}

		getUsers(){
			const deferred = $q.defer();
			const url = `${APP_CONFIG.SERVER_URL}/rutaQueTraigaTodosLosUsuarios`;
			$http.get(url).then(response => {
				deferred.resolve(this.retrieveUsers(response.data.data));
			}).catch(response => {
				deferred.reject(response.data);
			});
			return deferred.promise;

		}

	}

	return new usersFactory();

}]);