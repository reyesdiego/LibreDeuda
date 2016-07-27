/**
 * Created by kolesnikov-a on 18/04/2016.
 */
myApp.controller('ldeCtrl', ['$scope', 'ldeFactory', '$timeout', 'configService', 'dialogsService', '$q', '$location', '$state', '$uibModal',
    function($scope, ldeFactory, $timeout, configService, dialogsService, $q, $location, $state, $uibModal){

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
                RETURN_PLACE: 0
            }],
            STATUS: [{
                STATUS: 0
            }]
        };
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10
        };

        $scope.returnPlaces = [];

        $scope.statesContainers = configService.statusContainersAsArray();
        ldeFactory.getReturnPlaces(function(data){
            $scope.returnPlaces = data.data
        });

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

        $scope.getLdeData = function (){
            ldeFactory.getLde(function(result){
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

        $scope.saveLde = function(){
            ldeFactory.saveLde($scope.newContainer, function(response){
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
                            RETURN_PLACE: 0
                        }],
                        STATUS: [{
                            STATUS: 0
                        }]
                    };
                } else {
                    console.log(response);
                    dialogsService.error('Contenedor', response.data.message);
                }
            })

        };

        $scope.getLdeData();

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

        //Para facturar, cambiar lugar de devolución o CUIT, se requiere abrir un modal para agregar los demás datos
        //antes de llamar al método de actualización
        $scope.updateLdeEx = function(event, operation, lde){
            event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: 'lde/update.lde.html',
                controller: 'updateLdeCtrl',
                backdrop: 'static',
                resolve: {
                    operation: function () {
                        return operation;
                    },
                    ldeDate: function(){
                        return lde.RETURN_TO[0].DATE_TO;
                    },
                    places: function(){
                        return $scope.returnPlaces;
                    }
                }
            });
            modalInstance.result.then(function(ldeData){
                var updateData = null;
                switch (operation){
                    case 'invoice':
                        updateData = {
                            CONTENEDOR: lde.CONTAINER,
                            EMAIL_CLIENTE: ldeData.EMAIL_CLIENTE
                        };
                        break;
                    case 'place':
                        //TODO averiguar si ID_CLIENTE es obligatorio y de donde se obtiene
                        updateData = {
                            CONTENEDOR: lde.CONTAINER,
                            LUGAR_DEV: ldeData.LUGAR_DEV
                        };
                        break;
                    case 'forward':
                        updateData = {
                            CONTENEDOR: lde.CONTAINER,
                            CUIT: ldeData.CUIT,
                            FECHA_DEV: ldeData.FECHA_DEV
                        };
                        break;
                }
                ldeFactory.updateLde(updateData, operation, function(response){
                    console.log(response);
                })
            }, function(){
                //TODO es realmente necesaria esta función?
            })
        };

        //Para disable y enable, solo se requiere el contenedor
        $scope.updateLde = function(event, operation, container){
            event.stopPropagation();
            var containerBody = { CONTENEDOR: container };
            ldeFactory.updateLde(containerBody, operation, function(response){
                if (response.statusText == 'OK'){
                    console.log(response.data);
                } else {
                    console.log(response.data);
                    dialogsService.error('Error', response.data.message);
                }
            })
        };

        $scope.formatStatus = function(model){
            for (var i=0; i< $scope.statesContainers.length; i++) {
                if (model === $scope.statesContainers[i].id) {
                    return $scope.statesContainers[i].formatted;
                }
            }
        };

        $scope.formatPlace = function(model){
            for (var i=0; i< $scope.returnPlaces.length; i++) {
                if (model === $scope.returnPlaces[i].id) {
                    return $scope.returnPlaces[i].name;
                }
            }
        };

        $scope.openForm = function(){
            $state.transitionTo('lde.new');
            $timeout(function(){
                $location.hash('newContainer');
            }, 200);
        }

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

//Controlador para modal de actualización, para cuando se requieren datos adicionales antes de actualizar
myApp.controller('updateLdeCtrl', ['$scope', '$uibModalInstance', 'operation', 'ldeDate', 'places', function($scope, $uibModalInstance, operation, ldeDate, places){

    //'invoice', 'place', 'forward'
    $scope.operation = operation;

    $scope.returnPlaces = places;

    //El model incluye todos los posibles datos necesarios para cualquier operacion de update dado que no son muchos
    //y así puedo usar el mismo controlador para cualquiera de ellas
    $scope.updateModel = {
        EMAIL_CLIENTE: '',
        LUGAR_DEV: '',
        FECHA_DEV: ldeDate,
        CUIT: '',
        ID_CLIENTE: ''
    };

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

    $scope.save = function () {
        //Siempre devuelvo el model completo y luego cada método toma únicamente los datos que necesita
        $uibModalInstance.close($scope.updateModel);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };


}]);