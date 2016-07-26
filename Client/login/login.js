/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$rootScope', '$scope', '$state', 'loginFactory', 'storageService', 'dialogsService',
    function($rootScope, $scope, $state, loginFactory, storageService, dialogsService){

        $scope.user = {
            USUARIO: '',
            CLAVE: '',
            session: false,
            role: 'admin'
        };

        $scope.login = function(){
            loginFactory.login($scope.user, function(result){
                if (result.statusText == 'OK'){
                    //$rootScope.loggedUser = $scope.user.user;
                    //storageService.setObject('user', $scope.user);
                    $state.transitionTo('lde');
                } else {
                    dialogsService.error('Error', result.data.message);
                }
            })
        }

    }]);
