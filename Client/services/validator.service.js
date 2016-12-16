/**
 * Created by kolesnikov-a on 01/11/2016.
 */
myApp.service('validatorService', [function(){

	this.validateCuit = function(cuit){
		var result = false;
		var feed = '5432765432';
		var sum  = 0;
		var digit = 0;
		var diff11;
		var cv;

		try {
			cuit = cuit.toString();

			if (cuit.length === 11) {
				cv = parseInt(cuit[10]);
				for (var i = 0; i < 10; i++) {
					sum += (parseInt(feed[i]) * parseInt(cuit[i]));
				}
				diff11 = 11 - (sum % 11);
				if (diff11 === 10) {
					digit = 9;
				} if (diff11 !== 11) {
					digit = diff11;
				}

				if (digit === cv) {
					result = true;
				}
			}
		} catch (err) {
			result = false;
		}
		return result;
	};

	this.validateContainer = function(container){

		var response = false;
		var letters = {"A": 10, "B": 12, "C": 13, "D": 14, "E": 15, "F": 16, "G": 17, "H": 18, "I": 19, "J": 20, "K": 21, "L": 23, "M": 24, "N": 25, "O": 26, "P": 27, "Q": 28, "R": 29, "S": 30, "T": 31, "U": 32, "V": 34, "W": 35, "X": 36, "Y": 37, "Z": 38};
		var step1=0;

		if (container !== undefined) {
			for (var i = 0; i<4; i++) {
				step1 += (Math.pow(2, i) * parseInt(letters[container[i]], 10));
			}

			for (i = 4; i<10; i++) {
				step1 += (Math.pow(2, i) * parseInt(container[i], 10));
			}

			var digit = step1 % 11;

			if (parseInt(container[10], 10) === digit) {
				response = true;
			}
		}

		return response;

	};

	this.validateEmail = function(email){
		var re = /^(([^<>()[\]{}'^?\\.,!|//#%*-+=&;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
		return re.test(email);
	}

}]);