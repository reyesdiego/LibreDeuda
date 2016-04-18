/**
 * Created by kolesnikov-a on 15/04/2016.
 */

var myApp = angular.module('libreDeuda', [
   'ui.router',
    'ui.bootstrap',
    'ngSanitize'
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
    })

}]);

myApp.run(['$rootScope', function($rootScope){

    $rootScope.loginScreen = true;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        $rootScope.loginScreen = (toState.name == 'login');
    })

}]);