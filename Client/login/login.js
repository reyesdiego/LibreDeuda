/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$rootScope', '$scope', '$state', 'loginFactory', 'storageService', 'dialogsService', 'Idle',
    function($rootScope, $scope, $state, loginFactory, storageService, dialogsService, Idle){

        $scope.user = {
            user: '',
            password: '',
            session: false
        };

        $scope.login = function(){
            loginFactory.login($scope.user, function(result){
                console.log(result);
                if (result.statusText == 'OK'){
                    Idle.watch();
                    $rootScope.loggedUser = $scope.user.user;
                    storageService.setObject('user', $scope.user);
                    storageService.setKey('token', result.data);
                    $state.transitionTo('containers');
                } else {
                    console.log('hola');
                    dialogsService.error('Error', result.statusText);
                }
            })
        }

    }]);
