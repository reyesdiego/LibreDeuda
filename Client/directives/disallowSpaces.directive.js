/**
 * Created by kolesnikov-a on 31/10/2016.
 */
myApp.directive('disallowSpaces', function() {
	return {
		restrict: 'A',

		link: function($scope, $element) {
			$element.bind('keydown', function(e) {
				if (e.which === 32) {
					e.preventDefault();
				}
			});
		}
	}
});