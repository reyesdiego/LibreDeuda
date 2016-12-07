/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$rootScope', '$scope', '$state', 'storageService', 'dialogsService', 'Session',
    function($rootScope, $scope, $state, storageService, dialogsService, Session){

        $scope.user = Session;

        $scope.login = function(){
            $scope.user.login().then((result) => {
                if (result.statusText == 'OK'){
                    //$rootScope.loggedUser = $scope.user.user;
                    //storageService.setObject('user', $scope.user);
                    $state.transitionTo('lde');
                } else {
                    dialogsService.error('Error', result.data.message);
                }
            }, error => {
                dialogsService.error('Error', `Error de inicio de sesión. ${error.data.message}`);
            });
        };

        if ($scope.user.isAuthenticated()){
            $state.transitionTo('lde');
        }

    }]);
