/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('ldeCtrl', ['$scope', 'ldeFactory', '$timeout', 'dialogsService', '$q', '$location', '$state', '$uibModal', 'Lde', 'containersService', 'Session',
    function($scope, ldeFactory, $timeout, dialogsService, $q, $location, $state, $uibModal, Lde, containersService, Session){

        //$scope.search = 'ZCSU2576607';
        $scope.search = '';
        $scope.session = Session;

        $scope.containerLde = null;
        $scope.searchContainer = '';

        $scope.panelLde = {
            type: 'panel-info',
            message: `Aguarde mientras se cargan los datos.`
        };

        $scope.statesContainers = containersService.statusContainersAsArray();
        $scope.terminals = containersService.terminalsArray;
        $scope.returnPlaces = [];

        $scope.dataContainers = [];
        $scope.pageContainers = [];

        $scope.pagination = {
            page: 1,
            itemsPerPage: 10
        };

        ldeFactory.getReturnPlaces((data) => {
            $scope.returnPlaces = data.data
        });


        $scope.searchLde = function(){
            $scope.containerLde = null;
            ldeFactory.getLde($scope.searchContainer).then(data => {
                $scope.containerLde = data;
            }).catch(error => {
                dialogsService.error('Libre deuda', error.message);
            })
        };

        $scope.$on('socket:container', function(ev, data){
            //data.ANIMATE = true;
            //console.log(data);
            if ($scope.session.group == 'TER' && $scope.session.terminal == data.TERMINAL){
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
            }
            //$scope.reAnimate($scope.dataContainers[0]);
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

        $scope.getLdeData = function(){
            $scope.dataContainers = [];
            ldeFactory.getAllLde().then(data => {
                //console.log(data);
                if (data.length > 0){
                    $scope.dataContainers = data;
                } else {
                    $scope.panelLde = {
                        type: 'panel-info',
                        message: 'No se encontraron datos'
                    }
                }
            }).catch(error => {
                //console.log(error);
                let message = `Se ha producido un error al cargar los datos. ${error.message}`;
                dialogsService.error('Libre Deuda', message);
                $scope.panelLde = {
                    type: 'panel-danger',
                    message: message
                }
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
                    //console.log(data);
                }).catch((error) => {
                    //console.log(error);
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
                //console.log('todo ok');
                //console.log(data);
            }).catch((error) => {
                //console.log('todo mal');
                //console.log(error);
                dialogsService.error('LDE', error.message);
            })
        };

        $scope.getLdeData();

        $scope.$on('updateData', $scope.getLdeData);

    }]);

myApp.filter('containerStatus', ['containersService', function(containersService){

    return function(status){
        if (angular.isDefined(status)){
            return containersService.statusContainers[status] ? containersService.statusContainers[status].name : 'Sin definir';
        } else {
            return 'Sin definir';
        }
    }
}]);

myApp.filter('containerClass', ['containersService', function(containersService){

    return function (status){
        if (angular.isDefined(status)){
            return containersService.statusContainers[status] ? containersService.statusContainers[status].className : 'status-canceled';
        } else {
            return 'status-canceled'
        }

    }

}]);

myApp.filter('lugarDevolucion', [function(){

    return function(idPlace, places){
        let result = idPlace;
        for (let lugar of places){
            if (idPlace == lugar._id) {
                result = lugar.NOMBRE
            }
        }
        return result;
    }

}]);