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
        $scope.shipTrip = {
            SHIP: '',
            TRIP: '',
            CONTAINERS: []
        };
        $scope.newContainer = {
            CONTAINER: '',
            BL: '',
            DATE: new Date(),
            DETAIL: []
        };
        $scope.containerDetail = {
            CUIT: '',
            COMPANY: 'RAZONSOCIALPRUEBA',
            STATUS: 0
        };
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10
        };
        $scope.statesContainers = configService.statusContainersAsArray();

        $scope.$on('socket:container', function(ev, data){
            console.log('hola');
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
                if (result.statusText == 'OK'){
                    $scope.dataContainers = result.data.data;
                    console.log(($scope.dataContainers[0].RETURN_TO.concat($scope.dataContainers[0].CLIENT)).concat($scope.dataContainers[0].STATUS))
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
                delete data['ANIMATE']
            }, 10000)
        };

        $scope.showDetail = function(index){
            var realIndex = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage + index;
            $scope.filteredData[realIndex].SHOW = !$scope.filteredData[realIndex].SHOW;
        };

        $scope.setContainer = function(){
            $scope.newContainer.DETAIL.push($scope.containerDetail);
            $scope.shipTrip.CONTAINERS.push($scope.newContainer);
            $scope.newContainer = {
                CONTAINER: '',
                BL: '',
                DATE: new Date(),
                DETAIL: []
            };
            $scope.containerDetail = {
                CUIT: '',
                COMPANY: 'RAZONSOCIALPRUEBA',
                STATUS: 0
            };
        };

        function saveContainer (container){
            var deferred = $q.defer();
            containersFactory.saveContainer(container, function(response){
                if (response.statusText == 'OK'){
                    deferred.resolve();
                } else {
                    deferred.reject()
                }
            });
            return deferred.promise;
        }

        $scope.saveContainers = function(){
            var asyncCalls = [];
            $scope.shipTrip.CONTAINERS.forEach(function(container){
                container.SHIP = $scope.shipTrip.SHIP;
                container.TRIP = $scope.shipTrip.TRIP;
                asyncCalls.push(saveContainer(container));
                //TODO proceso de guardado batch de contenedores sincronizado para asegurar que todos se hayan guardado correctamente
            });
            $q.all(asyncCalls).then(function(result){

            }, function(){

            });
            /*containersFactory.saveContainer($scope.newContainer, function(response){
                if (response.statusText == 'OK'){
                    dialogsService.notify('Nuevo contenedor', 'Los datos se han guardado correctamente.');
                    $scope.newContainer = {
                        SHIP: '',
                        TRIP: '',
                        CONTAINER: '',
                        BL: '',
                        DATE: new Date(),
                        DETAIL: []
                    };
                    $scope.containerDetail = {
                        CUIT: '',
                        COMPANY: 'RAZONSOCIALPRUEBA',
                        STATUS: 0
                    };
                } else {
                    console.log(response);
                }
            })*/

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
            if (field == 'CUIT' || field == 'STATUS'){
                $scope.containerDetail[field] = '';
            } else {
                $scope.newContainer[field] = '';
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
        return configService.statusContainers[status];
    }
}]);