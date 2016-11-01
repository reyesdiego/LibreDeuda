/**
 * Created by kolesnikov-a on 01/11/2016.
 */
myApp.directive('onlyDigits', function () {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function (scope, element, attr, ctrl) {
			function inputValue(val) {
				if (val) {
					var digits = val.replace(/[^0-9]/g, '');

					if (digits !== val) {
						ctrl.$setViewValue(digits);
						ctrl.$render();
					}
					return parseInt(digits,10);
				}
				return undefined;
			}
			ctrl.$parsers.push(inputValue);
		}
	};
});