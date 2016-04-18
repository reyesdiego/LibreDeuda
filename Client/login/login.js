/**
 * Created by kolesnikov-a on 15/04/2016.
 */

myApp.controller('loginCtrl', ['$scope', '$state', 'loginMock', function($scope, $state, loginMock){

    $scope.user = {
        name: '',
        pass: '',
        session: false
    };

    $scope.login = function(){
        console.log($scope.user);

        loginMock.login($scope.user, function(result){
            if (result.status == 'OK'){
                $state.transitionTo('containers');
            }
        })
    }

}]);
