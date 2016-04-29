/**
 * Created by kolesnikov-a on 15/04/2016.
 */

var myApp = angular.module('libreDeuda', [
   'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'btford.socket-io',
    'ngAnimate',
    'ngIdle'
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
    $provide.factory('myHttpInterceptor', ['$rootScope', '$q', 'storageService', function($rootScope, $q, storageService) {
        return {
            // optional method
            'request': function(config) {
                // do something on success
                config.headers['Token'] = storageService.getKey('token');
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
                if (rejection.status == 401){
                    var deferred = $q.defer();
                    var req = {
                        config: rejection.config,
                        deferred: deferred
                    };
                    $rootScope.requests401.push(req);
                    $rootScope.$broadcast('loginRequired');
                    return deferred.promise;

                }
                if (rejection.status == -1) rejection.statusText = 'No se ha podido establecer comunicación con el servidor.';
                // do something on error
                /*if (canRecover(rejection)) {
                    return responseOrNewPromise
                }*/
                return $q.reject(rejection);
            }
        };
    }]);

    $httpProvider.interceptors.push('myHttpInterceptor');

}]);

myApp.config(['IdleProvider', 'KeepaliveProvider', function(IdleProvider, KeepaliveProvider) {
    IdleProvider.idle(900); // 15 min
    IdleProvider.timeout(60);
    KeepaliveProvider.interval(600); // heartbeat every 10 min
}]);

myApp.run(['$rootScope', 'appSocket', 'loginFactory', 'storageService', '$state', '$http', 'dialogsService', 'Idle', function($rootScope, appSocket, loginFactory, storageService, $state, $http, dialogsService, Idle){

    $rootScope.loggedUser = '';

    $rootScope.$on('IdleStart', function() {
        console.log('usuario inactivo');
        dialogsService.notify('Usuario inactivo', 'Se ha detectado que se encuentra inactivo, se procederá a cerrar su sesión en 60 segundos.');
    });

    $rootScope.logOut = function(){
        loginFactory.logout();
        Idle.unwatch();
        $state.transitionTo('login');
    };

    $rootScope.$on('IdleTimeout', function() {
        $rootScope.logOut();
    });

    $rootScope.$on('KeepAlive', function(){
        //TODO llamada para renovar el token por ahora se podría volver a llamar al login
    });

    $rootScope.requests401 = [];

    $rootScope.$on('loginRequired', function(){
        loginFactory.login(storageService.getObject('user'), function(result){
            if (result.statusText == 'OK'){
                $rootScope.$broadcast('loginConfirmed');
            } else {
                $state.transitionTo('login');
            }
        })
    });

    $rootScope.$on('loginConfirmed', function() {
        var i, requests = $rootScope.requests401;
        for (i = 0; i < requests.length; i++) {
            retry(requests[i]);
        }
        $rootScope.requests401 = [];

        function retry(req) {
            $http(req.config).then(function(response) {
                req.deferred.resolve(response);
            });
        }
    });

    $rootScope.socket = appSocket;
    $rootScope.socket.connect();

    $rootScope.loginScreen = true;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        $rootScope.loginScreen = (toState.name == 'login');
    })

}]);