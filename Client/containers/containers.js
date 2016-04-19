/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('containersCtrl', ['$scope', 'containersFactory', function($scope, containersFactory){

    $scope.dataContainers = [];
    $scope.errorResponse = {
        show: false,
        message: '',
        title: 'Error'
    };
    $scope.newContainer = {
        SHIP: '',
        TRIP: '',
        CONTAINER: '',
        DATE: new Date(),
        CUIT: '',
        COMPANY: '',
        RETURN_PLACE: '',
        STATUS: 0
    };

    $scope.getContainersData = function (){
        containersFactory.getContainers(function(result){
            console.log(result);
            if (result.statusText == 'OK'){
                $scope.dataContainers = result.data.data;
            } else {
                $scope.errorResponse.show = true;
                $scope.errorResponse.message = result.statusText;
            }
        })
    };

    $scope.saveContainer = function(){
        console.log($scope.newContainer);
    };

    $scope.getContainersData();
}]);