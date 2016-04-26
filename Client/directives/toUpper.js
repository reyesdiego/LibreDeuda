/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myApp.directive('toupper', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var mayusculas = function(input) {
                input ? element.css("text-transform","uppercase") : element.css("text-transform","initial");
                return input ? input.toUpperCase() : "";
            };

            modelCtrl.$parsers.push(mayusculas);

            scope.$watch(attrs.ngModel, function(valor){
                mayusculas(valor);
            });
        }
    };
});