/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.service('dialogsService', ['$uibModal', function($uibModal){

    return {
        error: function(title, message){
            $uibModal.open({
                controller: 'dialogsCtrl',
                templateUrl: './services/dialogs/error.html',
                resolve: {
                    title: function(){
                        return title;
                    },
                    message: function(){
                        return message;
                    }
                }
            })
        },
        notify: function(title, message){
            $uibModal.open({
                controller: 'dialogsCtrl',
                templateUrl: './services/dialogs/notify.html',
                resolve: {
                    title: function(){
                        return title
                    },
                    message: function(){
                        return message
                    }
                }
            })
        }
    }

}]);

myApp.controller('dialogsCtrl', ['$scope', '$uibModalInstance', 'title', 'message', function($scope, $uibModalInstance, title, message){

    $scope.modalData = {
        title: title,
        message: message
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);