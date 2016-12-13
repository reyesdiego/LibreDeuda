/**
 * Created by kolesnikov-a on 28/10/2016.
 */
myApp.service('Register', ['configService', '$http', '$q', function(configService, $http, $q){

	class Register {
		constructor(){
			this.data = {
				group: 'AGE',
				company: '',
				cuit: '',
				emailContact: '',
				telephone: '',
				//terminals: [],
				firstname: '',
				lastname: '',
				position: '',
				email: '',
				password: ''
			};
		}

		register(){
			let deferred = $q.defer();
			let inserturl = `${configService.serverUrl}/register`;
			//console.log(this.data);
			$http.post(inserturl, this.data).then((response) => {
				//console.log(response);
				deferred.resolve(response.data);
			}, (response) => {
				//console.log(response);
				deferred.reject(response.data);
				//deferred.resolve(this.data); //solo para probar
			});
			return deferred.promise;
		}

		set group(data){
			this.data.group = data;
		}

		set company(data){
			this.data.company = data;
		}

		set cuit(data){
			this.data.cuit = data;
		}

		get cuit(){
			return this.data.cuit;
		}

		set emailContact(data){
			this.data.emailContact = data;
		}

		set telephone(data){
			this.data.telephone = data;
		}

		set firstName(data){
			this.data.firstname = data;
		}

		set lastName(data){
			this.data.lastname = data;
		}

		set position(data){
			this.data.position = data;
		}

		set email(data){
			this.data.email = data;
		}

		get email(){
			return this.data.email;
		}

		set password(data){
			this.data.password = data;
		}

		get password(){
			return this.data.password;
		}
	}

	return new Register();

}]);