/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('ldeCtrl', ['$scope', 'ldeFactory', '$timeout', 'configService', 'dialogsService', '$q', '$location', '$state', '$uibModal', 'Lde',
    function($scope, ldeFactory, $timeout, configService, dialogsService, $q, $location, $state, $uibModal, Lde){

        $scope.lde = '';
        $scope.search = 'ZCSU2576607';

        $scope.panelMessage = `Ingrese un contenedor y presione el botón de buscar para obtener datos del libre deuda.`;

        $scope.statesContainers = configService.statusContainersAsArray();
        $scope.terminals = configService.terminalsArray;
        $scope.returnPlaces = [];

        ldeFactory.getReturnPlaces((data) => {
            $scope.returnPlaces = data.data
        });

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

        $scope.getLdeData = function (){
            //ZCSU2576607
            $scope.lde = '';
            ldeFactory.getLde($scope.search).then((data) =>{
                console.log(data);
                $scope.lde = new Lde(data);
                console.log($scope.lde);
                //$scope.dataContainers.push($scope.lde);
            }, (error) => {
                console.log(error);
                $scope.panelMessage = error.message;
            })
        };

        //Para facturar, cambiar lugar de devolución o CUIT, se requiere abrir un modal para agregar los demás datos
        //antes de llamar al método de actualización
        $scope.updateWithModal = function(event, operation){
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'lde/search/update.lde.html',
                controller: 'updateLdeCtrl',
                backdrop: 'static',
                resolve: {
                    operation: function () {
                        return operation;
                    },
                    ldeDate: function(){
                        return $scope.lde.FECHA_DEV;
                    },
                    places: function(){
                        return $scope.returnPlaces;
                    }
                }
            });
            modalInstance.result.then(function(ldeData){
                console.log(ldeData);
                console.log(operation);
                let promise = {};
                switch (operation){
                    case 'invoice':
                        promise = $scope.lde.deliver(ldeData.EMAIL_CLIENTE);
                        break;
                    case 'place':
                        promise = $scope.lde.updatePlace(ldeData.LUGAR_DEV);
                        break;
                    case 'forward':
                        promise = $scope.lde.forward(ldeData.CUIT, ldeData.FECHA_DEV);
                        break;
                }
                promise.then((data) => {
                    console.log(data);
                }, (error) => {
                    console.log(error);
                    dialogsService.error('LDE', error.message);
                })
            })
        };

        //Para disable y enable, solo se requiere el contenedor
        $scope.update = function(event, operation){
            event.stopPropagation();
            let promise = {};
            if (operation == 'disable'){
                promise = $scope.lde.disable();
            } else {
                promise = $scope.lde.enable();
            }
            promise.then((data) => {
                dialogsService.notify('Libre deuda', data.message);
                console.log('todo ok');
                console.log(data);
            }, (error) => {
                console.log('todo mal');
                console.log(error)
            })
        };

    }]);

myApp.filter('containerStatus', ['configService', function(configService){

    return function(status){
        if (angular.isDefined(status)){
            return configService.statusContainers[status] ? configService.statusContainers[status].name : 'Sin definir';
        } else {
            return 'Sin definir';
        }
    }
}]);

myApp.filter('containerClass', ['configService', function(configService){

    return function (status){
        if (angular.isDefined(status)){
            return configService.statusContainers[status] ? configService.statusContainers[status].className : 'status-canceled';
        } else {
            return 'status-canceled'
        }

    }

}]);