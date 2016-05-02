/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.service('configService', [function(){

    return {
        serverUrl: 'http://10.10.0.223:8086',
        statusContainers: {'0': 'Liberado', '5': 'Retirado', '9': 'Cancelado'},
        statusContainersAsArray: function(){
            var result = [];
            var status = this.statusContainers;
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var newValue = {
                        id: parseInt(key),
                        formatted: key + ' - ' + status[key]
                    };
                    result.push(newValue);
                }
            }
            return result;
        },
        terminalsArray: ['TRP', 'BACTSSA', 'TERMINAL4']
    }

}]);