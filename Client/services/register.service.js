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

		get group(){
			return this.data.group;
		}

		set company(data){
			this.data.company = data;
		}

		get company(){
			return this.data.company;
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

		get emailContact(){
			return this.data.emailContact;
		}

		set telephone(data){
			this.data.telephone = data;
		}

		get telephone(){
			return this.data.telephone;
		}

		set firstName(data){
			this.data.firstname = data;
		}

		get firstName(){
			return this.data.firstname;
		}

		set lastName(data){
			this.data.lastname = data;
		}

		get lastName(){
			return this.data.lastname;
		}

		set position(data){
			this.data.position = data;
		}

		get position(){
			return this.data.position;
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