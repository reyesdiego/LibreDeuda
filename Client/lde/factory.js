/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('ldeFactory', ['$http', 'configService', function($http, configService){

    var factory = {
        //Obtener todos los LDE's
        getLde: function(callback){
            var insertUrl = configService.serverUrl + '/lde';
            $http.get(insertUrl).then(function(response){
                callback(response);
            }, function(response){
                callback(response);
            })
        },
        //Informar un nuevo LDE
        //Parámetros: { 'TERMINAL': 'TRP',
        //              'BUQUE': 'ARGENTINO',
        //              'VIAJE': '2N333',
        //              'CONTENEDOR': 'SARASA',
        //              'BL': 'AGHSDKJAHSG6546',
        //              'FECHA_DEV': 'YYYY-MM-DD',
        //              'LUGAR_DEV': 'V3243',
        //              'CUIT': '5654984321654',
        //              'ID_CLIENTE': '25' }
        saveLde: function(dataContainer, callback){
            var insertUrl = configService.serverUrl + '/lde';
            $http.post(insertUrl, dataContainer).then(function(response){
                callback(response);
            }, function(response){
                callback(response);
            })
        },
        //Operación 'enable' (solo agente marítimo) - Habilitar LDE anteriormente anulado
        //------------------------------------------- Parámetros: { 'CONTENEDOR': 'SARASA' }
        //Operación 'invoice' (solo terminales)  - LDE facturado
        //---------------------------------------- Parámetros: { 'CONTENEDOR': 'SARASA', 'EMAIL_CLIENTE': 'MAIL' }
        //Operación 'disable' (solo agente marítimo) - Anular un LDE
        //-------------------------------------------- Parámetros: { 'CONTENEDOR': 'SARASA' }
        //Operación 'place' (solo agente marítimo) - Cambiar lugar de devolución
        //------------------------------------------ Parámetros: { 'ID_CLIENTE': '25', 'CONTENEDOR': 'SARASA', 'LUGAR_DEV': 'LUGAR1' }
        //Operación 'forward' (solo Forwardings) - Habilitar LDE a un CUIT específico, puede especificar una fecha de devolución menor a la original
        //---------------------------------------- Parámetros: { 'CONTENEDOR': 'SARASA', 'CUIT': '6546865621654', 'FECHA_DEV': 'YYYY-MM-DD' }
        updateLde: function(ldeData, operation, callback){
            var insertUrl = configService.serverUrl + '/lde/' + operation;
            $http.put(insertUrl, ldeData).then(function(response){
                callback(response);
            }, function(response){
                callback(response)
            })
        },
        //Consulta de lugares de devolución - Opcionalmente se puede pasar un ID para obtener un lugar específico
        getReturnPlaces: function(callback){
            var insertUrl = configService.serverUrl + '/lde/lugar';
            $http.get(insertUrl).then(function(response){
                callback(response.data)
            }, function(response){
                callback(response.data)
            })
        }
    };

    return factory;

}]);
