/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.factory('loginFactory', ['$http', function($http){

    return {
        login: function(user, callback){
            //TODO reemplazar esto por el verdadero login
            var response = {
                status: 200,
                statusText: 'OK',
                data: {
                    token: 'jasvkdajsvhdkajsvhdklsadbfñasiojbdñcvpasjidfnvqeoinrvljhbatgsdicviduycvewr'
                }
            };
            callback(response);
        }
    }

}])