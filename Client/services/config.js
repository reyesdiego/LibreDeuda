/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.service('configService', [function(){

    return {
        serverUrl: 'http://10.10.0.223:8086',
        statusContainers: {'0': 'Liberado', '5': 'Retirado', '9': 'Cancelado'}
    }

}]);