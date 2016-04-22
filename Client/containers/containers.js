/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('containersCtrl', ['$scope', 'containersFactory', '$timeout', 'configService', function($scope, containersFactory, $timeout, configService){

    $scope.search = '';
    $scope.dataContainers = [];
    $scope.filteredData = [];
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
        STATUS: 'Liberado'
    };
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 15
    };
    $scope.statesContainers = configService.statusContainersAsArray();

    $scope.$on('socket:container', function(ev, data){
        console.log(data);
        data.CLASS = 'animated-row';
        data.ANIMATE = false;
        $scope.dataContainers.unshift(data);
        $scope.reAnimate($scope.dataContainers[0]);
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
                $scope.dataContainers.forEach(function(data){
                    data.ANIMATE = true
                })
            } else {
                $scope.errorResponse.show = true;
                $scope.errorResponse.message = result.statusText;
            }
        })
    };

    $scope.pageChanged = function(){
        $scope.animate = false;
        $scope.reAnimate();
    };

    $scope.reAnimate = function(data){
        $timeout(function(){
            data.ANIMATE = true
        }, 5)
    };

    $scope.showDetail = function(index){
        var realIndex = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage + index;
        $scope.filteredData[realIndex].SHOW = !$scope.filteredData[realIndex].SHOW;
    };

    $scope.saveContainer = function(){
        console.log($scope.newContainer);
    };

    $scope.getContainersData();

    $scope.datePopUp = {
        opened: false,
        format: 'dd/MM/yyyy',
        options: {
            formatYear: 'yyyy',
            startingDay: 1
        }
    };

    $scope.openDate = function(){
        $scope.datePopUp.opened = true;
    };

    $scope.eraseField = function(field){
        $scope.newContainer[field] = '';
    }

}]);

myApp.filter('containerStatus', ['configService', function(configService){

    return function(status){
        return configService.statusContainers[status];
    }
}]);