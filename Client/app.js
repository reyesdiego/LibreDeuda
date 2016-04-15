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

    $stateProvider.state('sucursales', {
        url: '/login',
        templateUrl: 'login/login.html',
        controller: 'loginCtrl'
    })

}]);