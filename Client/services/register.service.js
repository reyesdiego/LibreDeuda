/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.service('Register', ['configService', '$http', '$q', function(configService, $http, $q){

	this.data = {
		group: 'TER',
		company: '',
		cuit: '',
		emailContact: '',
		telephone: '',
		terminals: [],
		firstName: '',
		lastName: '',
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
			deferred.resolve();
		}, (response) => {
			console.log(response);
			//deferred.reject();
			deferred.resolve(this.data); //solo para probar
		});
		return deferred.promise;
	}

}]);