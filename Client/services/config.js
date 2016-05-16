/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.service('configService', [function(){

    return {
        //serverUrl: 'http://10.10.0.223:8086', //Servidor Diego
        serverUrl: 'http://localhost:8086', //Local contra base en pc de diego
        statusContainers: {'0': {
            name: 'Liberado',
            className: 'status-free'
        }, '3': {
            name: 'Retirado?',
            className: 'status-retired'
        }, '5': {
            name:'Retirado',
            className: 'status-retired'
        }, '9': {
            name:'Cancelado',
            className: 'status-canceled'
        }},
        statusContainersAsArray: function(){
            var result = [];
            var status = this.statusContainers;
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var newValue = {
                        id: parseInt(key),
                        formatted: key + ' - ' + status[key].name,
                        className: status[key].className
                    };
                    result.push(newValue);
                }
            }
            return result;
        },
        terminalsArray: ['TRP', 'BACTSSA', 'TERMINAL4']
    }

}]);