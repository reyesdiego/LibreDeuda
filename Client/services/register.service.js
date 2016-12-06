/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.service('Register', ['configService', '$http', '$q', function(configService, $http, $q){

	this.data = {
		group: 'AGE',
		company: '',
		cuit: '',
		emailContact: '',
		telephone: '',
		terminals: [],
		firstname: '',
		lastname: '',
		position: '',
		email: '',
		password: ''
	};

	this.register = function(){
		let deferred = $q.defer();
		let inserturl = `${configService.serverUrl}/register`;
		console.log(this.data);
		$http.post(inserturl, this.data).then((response) => {
			console.log(response);
			deferred.resolve(response.data);
		}, (response) => {
			console.log(response);
			deferred.reject(response.data);
			//deferred.resolve(this.data); //solo para probar
		});
		return deferred.promise;
	}

}]);