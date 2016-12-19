/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.service('configService', [function(){

    return {
        //serverUrl: 'https://pagoelectronico.puertobuenosaires.gob.ar:8086' //Servidor produccion
        //serverUrl: 'https://10.10.0.223:8086' //Servidor Diego
        serverUrl: 'https://10.1.0.55:8086' //Servidor Desarrollo
        //serverUrl: 'https://localhost:8086' //Local contra base en pc de diego
    }

}]);