/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$scope', '$state', 'loginFactory', 'storageService', function($scope, $state, loginFactory, storageService){

    $scope.user = {
        name: '',
        pass: '',
        session: false
    };

    $scope.login = function(){
        console.log($scope.user);

        loginFactory.login($scope.user, function(result){
            if (result.statusText == 'OK'){
                storageService.setObject('user', $scope.user);
                storageService.setKey('token', result.data.token);
                $state.transitionTo('containers');
            }
        })
    }

}]);
