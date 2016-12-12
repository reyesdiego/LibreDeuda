/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.service('dialogsService', ['$uibModal', function($uibModal){

    return {
        error: function(title, message){
            return $uibModal.open({
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
            return $uibModal.open({
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
        },
        login: function(){
            return $uibModal.open({
                controller: 'loginDialogCtrl',
                templateUrl: './services/dialogs/login.html',
                backdrop: 'static'
            })
        }
    }

}]);

myApp.controller('dialogsCtrl', ['$scope', '$uibModalInstance', 'title', 'message', function($scope, $uibModalInstance, title, message){

    $scope.modalData = {
        title: title,
        message: message
    };

    //console.log($scope.modalData);

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);

myApp.controller('loginDialogCtrl', ['$scope', '$uibModalInstance',  'Session', function($scope, $uibModalInstance, Session){

    $scope.user = Session;

    $scope.login = function(){
        $scope.user.login().then(() => {
            $uibModalInstance.close();
        }, (error) => {

        });
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    }


}]);