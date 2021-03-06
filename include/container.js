/**
 * Created by diego on 7/25/14.
 * http://en.wikipedia.org/wiki/ISO_6346
 * for testing use : CSQU3054383
 */
//@ts-check

"use strict";
/**
 * Este módulo chequea el dígito verificador del número de Contenedor
 * 
 * @param {String} container 
 * @returns 
 */
const check = (container) => {
    var response = false;
    var letters = { A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20, K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38 };
    var step1 = 0;

    if (container !== undefined) {
        for (var i = 0; i < 4; i++) {
            step1 += (Math.pow(2, i) * parseInt(letters[container[i]], 10));
        }

        for (i = 4; i < 10; i++) {
            step1 += (Math.pow(2, i) * parseInt(container[i], 10));
        }

        var digit = step1 % 11;

        if (parseInt(container[10], 10) === digit) {
            response = true;
        }
    }

    return response;
};

module.exports = check;