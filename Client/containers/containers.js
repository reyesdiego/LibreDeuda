/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('containersCtrl', ['$scope', 'containersFactory', function($scope, containersFactory){

    $scope.dataContainers = {};

    $scope.getContainersData = function (){
        containersFactory.getContainers(function(result){
            console.log(result);
            if (result.statusText == 'OK'){
                $scope.dataContainers = result.data.data;
            }
        })
    };

    $scope.getContainersData();
}]);