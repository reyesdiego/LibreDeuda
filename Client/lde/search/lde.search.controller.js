/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('ldeCtrl', ['$scope', 'ldeFactory', '$timeout', 'configService', 'dialogsService', '$q', '$location', '$state', '$uibModal', 'Lde',
    function($scope, ldeFactory, $timeout, configService, dialogsService, $q, $location, $state, $uibModal, Lde){

        //$scope.search = 'ZCSU2576607';
        $scope.search = '';

        $scope.panelMessage = `Aguarde mientras se cargan los datos.`;

        $scope.statesContainers = configService.statusContainersAsArray();
        $scope.terminals = configService.terminalsArray;
        $scope.returnPlaces = [];

        $scope.dataContainers = [];

        ldeFactory.getReturnPlaces((data) => {
            $scope.returnPlaces = data.data
        });

        $scope.$on('socket:container', function(ev, data){
            console.log('esto');
            //data.ANIMATE = true;
            console.log(data);
            let ldeData = {
                TERMINAL: data.TERMINAL,
                BUQUE: data.SHIP,
                VIAJE: data.TRIP,
                CONTENEDOR: data.CONTAINER,
                BL: data.BL,
                FECHA_DEV: data.RETURN_TO[0].DATE_TO,
                LUGAR_DEV: data.RETURN_TO[0].PLACE,
                CUIT: data.CLIENT[0].CUIT,
                STATUS: data.STATUS[0].STATUS
            };
            $scope.dataContainers.unshift(new Lde(ldeData));
            //$scope.reAnimate($scope.dataContainers[0]);
        });

        $scope.$on('socket:status', function(ev, data){
            console.log('y esto');

            $scope.dataContainers.forEach(function(registry){

                if (registry.CONTAINER == data.CONTAINER) {
                    data.COMPANY = data.COMPANY || registry.DETAIL[0].COMPANY;
                    data.CUIT = data.CUIT || registry.DETAIL[0].CUIT;
                    registry.DETAIL.unshift(data);
                }
            });
        });

        $scope.getLdeData = function(){
            $scope.dataContainers = [];
            ldeFactory.getAllLde().then(data => {
                //console.log(data);
                for (let lde of data.data){
                    lde = new Lde(lde);
                    $scope.dataContainers.push(lde);
                }
            }, error => {
                console.log(error);
                dialogsService.error('Libre Deuda', `Se ha producido un error al cargar los datos. ${error.message}`);
            })
        };

        //Para facturar, cambiar lugar de devolución o CUIT, se requiere abrir un modal para agregar los demás datos
        //antes de llamar al método de actualización
        $scope.updateWithModal = function(event, operation, lde){
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
                        return lde.FECHA_DEV;
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
                        promise = lde.deliver(ldeData.EMAIL_CLIENTE);
                        break;
                    case 'place':
                        promise = lde.updatePlace(ldeData.LUGAR_DEV);
                        break;
                    case 'forward':
                        promise = lde.forward(ldeData.CUIT, ldeData.FECHA_DEV);
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
        $scope.update = function(event, operation, lde){
            event.stopPropagation();
            let promise = {};
            if (operation == 'disable'){
                promise = lde.disable();
            } else {
                promise = lde.enable();
            }
            promise.then((data) => {
                dialogsService.notify('Libre deuda', data.message);
                console.log('todo ok');
                console.log(data);
            }, (error) => {
                console.log('todo mal');
                console.log(error);
                dialogsService.error('LDE', error.message);
            })
        };

        $scope.getLdeData();

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