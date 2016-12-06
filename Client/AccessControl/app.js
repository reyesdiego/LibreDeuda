/**
 * Created by kolesnikov-a on 06/12/2016.
 */

var myApp = angular.module('libreDeudaAccessControl', [
	'ui.router',
	'ui.bootstrap'
]);

myApp.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
	$urlRouterProvider.otherwise('/login');

	$stateProvider.state('login', {
		url: '/login',
		templateUrl: 'login/login.view.html',
		controller: 'loginCtrl'
	}).state('users', {
		url: '/users',
		templateUrl: 'users/users.view.html',
		controller: 'usersCtrl'
	})

}]);

//Configuración para interceptar respuestas http y tratar errores
myApp.config(['$provide', '$httpProvider', function($provide, $httpProvider){

	// register the interceptor as a service
	$provide.factory('myHttpInterceptor', ['$rootScope', '$q',
		function($rootScope, $q) {
			return {
				// optional method
				'request': function(config) {
					// do something on success
					config.headers['Token'] = $rootScope.session.getToken();
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
					console.log(rejection);
					if (rejection.status == 404){ //Not found
						rejection.data = {
							status: 'ERROR',
							message: 'No se ha encontrado la ruta en el servidor.'
						}
					}

					/*if (rejection.status == 401){ //Forbidden
					 if (rejection.config.url != configService.serverUrl + '/login'){
					 if (rejection.data.message != 'No tiene privilegios para realizar esta petición.' && rejection.data.message != 'No tiene permisos para realizar esta operación'){
					 $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
					 var deferred = $q.defer();
					 var req = {
					 config: rejection.config,
					 deferred: deferred
					 };
					 $rootScope.requests401.push(req);

					 return deferred.promise;
					 }
					 //$state.transitionTo('login');
					 }
					 }*/

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

myApp.run(['$rootScope', '$state', 'dialogsService', 'Session',
	function($rootScope, $state, dialogsService, Session){

		$rootScope.session = Session;

		$rootScope.logOut = function(){
			$rootScope.session.logOut();
			$state.transitionTo('login');
		};

		$rootScope.loginScreen = true;

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromParams) {
			$rootScope.loginScreen = (toState.name == 'login');
		});

		/*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

			if (angular.isDefined(toState.data)){ //state requires logged user
				var authorizedRoles = toState.data.authorizedRoles;
				if ($rootScope.session.isAuthenticated()){
					if (!$rootScope.session.isAuthorized(authorizedRoles)){
						event.preventDefault();
					}
				} else {
					event.preventDefault();
					// user is not logged in
					$rootScope.routeChange ={
						to: toState.name,
						from: fromState.name
					};
				}

			}

		})*/

	}]);