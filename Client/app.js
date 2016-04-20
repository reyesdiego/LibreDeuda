/**
 * Created by kolesnikov-a on 15/04/2016.
 */

var myApp = angular.module('libreDeuda', [
   'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'btford.socket-io',
    'ngAnimate'
]);

myApp.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login/login.html',
        controller: 'loginCtrl'
    }).state('containers', {
        url: '/containers',
        templateUrl: 'containers/containers.html',
        controller: 'containersCtrl'
    }).state('containers.new', {
        url: '/containers/new',
        templateUrl: 'containers/containers.new.html'
    })

}]);

//Configuración para interceptar respuestas http y tratar errores
myApp.config(['$provide', '$httpProvider', function($provide, $httpProvider){

    // register the interceptor as a service
    $provide.factory('myHttpInterceptor', function($q) {
        return {
            // optional method
            'request': function(config) {
                // do something on success
                return config;
            },

            // optional method
            'requestError': function(rejection) {
                // do something on error

                /*if (canRecover(rejection)) {
                    return responseOrNewPromise
                }*/
                return $q.reject(rejection);
            },



            // optional method
            'response': function(response) {
                // do something on success
                return response;
            },

            // optional method
            'responseError': function(rejection) {
                //TODO config custom messages for http Error status
                if (rejection.status == -1) rejection.statusText = 'No se ha podido establecer comunicación con el servidor.';
                // do something on error
                /*if (canRecover(rejection)) {
                    return responseOrNewPromise
                }*/
                return $q.reject(rejection);
            }
        };
    });

    $httpProvider.interceptors.push('myHttpInterceptor');

}]);

myApp.run(['$rootScope', 'appSocket', function($rootScope, appSocket){
    $rootScope.socket = appSocket;
    $rootScope.socket.connect();

    $rootScope.loginScreen = true;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        $rootScope.loginScreen = (toState.name == 'login');
    })

}]);