/**
 * Created by kolesnikov-a on 18/04/2016.
 */

myApp.factory('loginMock', [function(){

    var factory = {

        login: function(user, callback){
            var response = {
                status: 'OK',
                token: 'jasvkdajsvhdkajsvhd'
            };
            callback(response);
        }
    };

    return factory;

}]);