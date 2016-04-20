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

    $scope.$on('socket:container', function(ev, data){
        console.log(data);
        $scope.dataContainers.push(data);
    });

    $scope.$on('socket:status', function(ev, data){
        $scope.dataContainers.forEach(function(registry){
            if (registry.CONTAINER == data.CONTAINER) {
                data.COMPANY = data.COMPANY || registry.DETAIL[0].COMPANY;
                data.CUIT = data.CUIT || registry.DETAIL[0].CUIT;
                registry.DETAIL.unshift(data);
            }
        });
    });

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

    $scope.showDetail = function(index){
        $scope.dataContainers[index].SHOW = !$scope.dataContainers[index].SHOW;
    };

    $scope.saveContainer = function(){
        console.log($scope.newContainer);
    };

    $scope.getContainersData();
}]);

myApp.filter('containerStatus', ['configService', function(configService){

    return function(status){
        return configService.statusContainers[status];
    }
}]);