/**
 * Created by kolesnikov-a on 15/04/2016.
 */

let myApp = angular.module('libreDeuda', [
    'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'btford.socket-io',
    'ngAnimate',
    'ngIdle'
]);

myApp.constant('USER_ROLES', {
    all: '*',
    terminal: 'TER',
    agent: 'AGE',
    forwarder: 'FOR'
});

myApp.constant('AUTH_EVENTS', {
    notAuthenticated: 'loginRequired',
    notAuthorized: 'notAuthorized',
    loginSucces: 'loginConfirmed'
});

myApp.config(['$urlRouterProvider', '$stateProvider', 'USER_ROLES', function($urlRouterProvider, $stateProvider, USER_ROLES){
    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login/login.html',
        controller: 'loginCtrl'
    }).state('consultLde', {
		url: '/consultLde',
		templateUrl: 'lde/consult/lde.consult.html',
		controller: 'ldeConsultCtrl as vmConsult'
	}).state('lde', {
        url: '/lde',
        templateUrl: 'lde/search/lde.search.html',
        controller: 'ldeCtrl',
        data: {
            authorizedRoles: [USER_ROLES.all]
        }
    }).state('lde.new', {
        url: '/new',
        templateUrl: 'lde/new/lde.new.html',
        controller: 'newLdeCtrl',
        data: {
            authorizedRoles: [USER_ROLES.agent]
        }
    }).state('preGate', {
        url: '/preGate',
        templateUrl: 'pregate/search/pregate.search.html',
        controller: 'preGateCtrl',
        data: {
            authorizedRoles: [USER_ROLES.terminal, USER_ROLES.agent]
        }
    }).state('preGate.new', {
        url: '/new',
        templateUrl: 'pregate/new/pregate.new.html',
        controller: 'newPreGateCtrl',
        data: {
            authorizedRoles: [USER_ROLES.agent]
        }
    }).state('register', {
        url: '/register',
        templateUrl: 'register/register.html',
        controller: 'registerCtrl'
    }).state('help', {
        url: '/help',
        templateUrl: 'register/help.html'
    })

}]);

//Configuración para interceptar respuestas http y tratar errores
myApp.config(['$provide', '$httpProvider', function($provide, $httpProvider){

    // register the interceptor as a service
    $provide.factory('myHttpInterceptor', ['$rootScope', '$q', 'configService', 'AUTH_EVENTS',
        function($rootScope, $q, configService, AUTH_EVENTS) {
            return {
                // optional method
                'request': function(config) {
                    // do something on success
                    config.headers['Token'] = $rootScope.session.token;
                    config.headers['Content-Type'] = 'application/json';
                    //TODO verificar tiempos de respuestas para diferentes llamadas...
                    //config.timeout = 2000;

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
                    //console.log(rejection);
                    if (rejection.status == 404){ //Not found
                        rejection.data = {
                            status: 'ERROR',
                            message: 'No se ha encontrado la ruta en el servidor.'
                        }
                    }

                    //console.log(rejection);
                    if (rejection.status == 401){ //Forbidden
                        if (rejection.config.url != configService.serverUrl + '/login'){
                            if (rejection.data.message != 'No tiene privilegios para realizar esta petición.' && rejection.data.message != 'No tiene permisos para realizar esta operación'){
                                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                                const deferred = $q.defer();
                                const req = {
                                    config: rejection.config,
                                    deferred: deferred
                                };
                                $rootScope.requests401.push(req);

                                return deferred.promise;
                            }
                            //$state.transitionTo('login');
                        }
                    }

                    if (rejection.status == -1) rejection.data = { message: 'No se ha podido establecer comunicación con el servidor.', status: 'ERROR' };
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
    KeepaliveProvider.interval(45); // heartbeat every 45 seconds
}]);

myApp.run(['$rootScope', 'appSocket', 'storageService', '$state', '$http', 'dialogsService', 'Idle', 'AUTH_EVENTS', 'Session', '$timeout', 'Title',
    function($rootScope, appSocket, storageService, $state, $http, dialogsService, Idle, AUTH_EVENTS, Session, $timeout, Title){

		function retry(req) {
			$http(req.config).then((response) => {
				req.deferred.resolve(response);
			});
		}

        Title.timedOutMessage('Su sesión ha expirado.');
        Title.idleMessage('Tiene {{ seconds }} hasta que su sesión expire.');

        $rootScope.session = Session;

        if ($rootScope.session.isAuthenticated){
            //$rootScope.session.reloadData();
            Idle.watch();
        }

        $rootScope.requests401 = [];
        $rootScope.routeChange = {
            to: '',
            from: ''
        };
        $rootScope.loggedUser = '';
        $rootScope.dialogIdle = null;

        $rootScope.$on('IdleStart', () => {
            $rootScope.dialogIdle = dialogsService.notify('Usuario inactivo', 'Se ha detectado que se encuentra inactivo, se procederá a cerrar su sesión en 60 segundos.');
        });

        $rootScope.logOut = () => {
            $rootScope.session.logOut();
            Idle.unwatch();
            $state.transitionTo('login');
        };

        $rootScope.$on('IdleTimeout', () => {
            $rootScope.dialogIdle.dismiss();
            dialogsService.notify('Usuario inactivo', 'Se ha cerrado su sesión debido a que ha sobrepasado el período de inactividad permitido.');
            $rootScope.logOut();
        });

        $rootScope.$on('IdleEnd', () => {
            $rootScope.dialogIdle.dismiss();
            Title.restore();
        });

        $rootScope.$on('Keepalive', () => {
            $rootScope.session.keepAlive(() => {}, (error) => {
                console.log(error);
            })
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, () => {
            dialogsService.notify('Error de acceso', 'Su usario no se encuentra autorizado para realizar esa operación.')
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, () => {
            if ($rootScope.routeChange.from != 'login'){
                const loginDialog = dialogsService.login();
                loginDialog.result.then((result) => {
                    if (result.statusText != 'OK'){
                        dialogsService.error('Error', result.data);
                        $state.transitionTo('login');
                    } else {
						$rootScope.loginScreen = false;
                    }
                }).catch(() => {
					$state.transitionTo('login');
				});
            } else {
                dialogsService.notify('No autorizado', 'Se requiere un inicio de sesión antes de poder continuar.')
            }
            //$state.transitionTo('login');
        });

        $rootScope.$on(AUTH_EVENTS.loginSucces, () => {
            Title.restore();
            Idle.watch();

            //$rootScope.session.setData(user);
            //$rootScope.session.setToken(token);

            if ($rootScope.requests401.length > 0){
                let i, requests = $rootScope.requests401;
                for (i = 0; i < requests.length; i++) {
                    retry(requests[i]);
                }
                $rootScope.requests401 = [];
            } else if ($rootScope.routeChange.to != '' ){
                const next = $rootScope.routeChange.to;
                $rootScope.routeChange = {
                    to: '',
                    from: ''
                };
                $state.transitionTo(next);
            }

        });

        $rootScope.socket = appSocket;
        $rootScope.socket.connect();

        $rootScope.loginScreen = true;

        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromParams) => {
            $rootScope.loginScreen = (toState.name == 'login');
        });

        $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (angular.isDefined(toState.data)){ //state requires logged user
                const authorizedRoles = toState.data.authorizedRoles;
                if (authorizedRoles){
                    if ($rootScope.session.isAuthenticated){
                        if (!$rootScope.session.isAuthorized(authorizedRoles)){
                            event.preventDefault();
                            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                        }
                    } else {
                        event.preventDefault();
                        // user is not logged in
                        $rootScope.routeChange ={
                            to: toState.name,
                            from: fromState.name
                        };
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                }
            }

        })

    }]);