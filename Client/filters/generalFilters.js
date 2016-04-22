/**
 * Created by kolesnikov-a on 21/04/2016.
 */
myApp.filter('startFrom', [function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
}]);