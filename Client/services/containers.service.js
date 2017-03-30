/**
 * Created by kolesnikov-a on 19/12/2016.
 */

myApp.service('containersService', [function(){

	class containersService {
		constructor(){
			this.statusContainers = {'0': {
				name: 'HABILITADO',
				className: 'status-free'
			}, '3': {
				name: 'FACTURADO',
				className: 'status-retired'
			}, '5': {
				name:'RETIRADO',
				className: 'status-retired'
			}, '9': {
				name:'ANULADO',
				className: 'status-canceled'
			}};
			this.terminalsArray = ['TRP', 'BACTSSA', 'TERMINAL4']
		}

		statusContainersAsArray(){
			let result = [];
			for (var key in this.statusContainers) {
				if (this.statusContainers.hasOwnProperty(key)) {
					let newValue = {
						id: parseInt(key),
						formatted: `${key} - ${this.statusContainers[key].name}`,
						className: this.statusContainers[key].className
					};
					result.push(newValue);
				}
			}
			return result;
		}
	}

	return new containersService();

}]);
