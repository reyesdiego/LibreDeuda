/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$scope', '$state', 'loginFactory', 'storageService', 'dialogsService',
    function($scope, $state, loginFactory, storageService, dialogsService){

        $scope.user = {
            name: '',
            pass: '',
            session: false
        };

        $scope.login = function(){
            loginFactory.login($scope.user, function(result){
                console.log(result);
                if (result.statusText == 'OK'){
                    storageService.setObject('user', $scope.user);
                    storageService.setKey('token', result.data);
                    $state.transitionTo('containers');
                } else {
                    dialogsService.error('Error', 'Usuario o contraseña incorrectos.');
                }
            })
        }

    }]);
