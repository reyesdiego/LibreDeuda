/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('containersCtrl', ['$scope', 'containersFactory', '$timeout', 'configService', 'dialogsService', '$q',
    function($scope, containersFactory, $timeout, configService, dialogsService, $q){

        $scope.search = '';
        $scope.dataContainers = [];
        $scope.filteredData = [];
        $scope.errorResponse = {
            show: false,
            message: '',
            title: 'Error'
        };
        $scope.newContainer = {
            TERMINAL: '',
            SHIP: '',
            TRIP: '',
            CONTAINER: '',
            BL: '',
            CLIENT: [{
                COMPANY: 'RAZONSOCIALPRUEBA',
                CUIT: ''
            }],
            RETURN_TO: [{
                DATE_TO: new Date(),
                RETURN_PLACE: ''
            }],
            STATUS: [{
                STATUS_ID: 0
            }]
        };
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10
        };
        $scope.statesContainers = configService.statusContainersAsArray();
        $scope.terminals = configService.terminalsArray;

        $scope.$on('socket:container', function(ev, data){
            data.ANIMATE = true;
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
                } else {
                    $scope.errorResponse.show = true;
                    $scope.errorResponse.message = result.data.message;
                }
            })
        };

        $scope.pageChanged = function(){
            $scope.animate = false;
            $scope.reAnimate();
        };

        $scope.reAnimate = function(data){
            $timeout(function(){
                delete data['ANIMATE']
            }, 10000)
        };

        $scope.showDetail = function(index){
            var realIndex = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage + index;
            $scope.filteredData[realIndex].SHOW = !$scope.filteredData[realIndex].SHOW;
        };

        $scope.saveContainer = function(){
            containersFactory.saveContainer($scope.newContainer, function(response){
                if (response.statusText == 'OK'){
                    dialogsService.notify('Nuevo contenedor', 'Los datos se han guardado correctamente.');
                    $scope.newContainer = {
                        TERMINAL: '',
                        SHIP: '',
                        TRIP: '',
                        CONTAINER: '',
                        BL: '',
                        CLIENT: [{
                            COMPANY: 'RAZONSOCIALPRUEBA',
                            CUIT: ''
                        }],
                        RETURN_TO: [{
                            DATE_TO: new Date(),
                            RETURN_PLACE: ''
                        }],
                        STATUS: [{
                            STATUS_ID: 0
                        }]
                    };
                } else {
                    console.log(response);
                    dialogsService.error('Contenedor', response.data.message);
                }
            })

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

        $scope.eraseField = function(field, detail){
            if (!detail){
                $scope.newContainer[field] = '';
            } else {
                $scope.newContainer[detail][0][field] = '';
            }
        };

        $scope.formatStatus = function(model){
            for (var i=0; i< $scope.statesContainers.length; i++) {
                if (model === $scope.statesContainers[i].id) {
                    return $scope.statesContainers[i].formatted;
                }
            }
        };

    }]);

myApp.filter('containerStatus', ['configService', function(configService){

    return function(status){
        if (angular.isDefined(status)){
            return configService.statusContainers[status].name;
        } else {
            return 'Sin definir';
        }

    }
}]);

myApp.filter('containerClass', ['configService', function(configService){

    return function (status){
        if (angular.isDefined(status)){
            return configService.statusContainers[status].className;
        } else {
            return 'status-canceled'
        }

    }

}]);