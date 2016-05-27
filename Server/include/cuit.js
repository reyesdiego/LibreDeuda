/**
 * Created by diego on 24/05/16.
 */

let cuit = (cuit) => {
    var result = false;
    var feed = '5432765432';
    var sum  = 0;
    var digit = 0;

    cuit = cuit.toString();

    if (cuit.length === 11) {
        for (var i = 0; i < 10; i++) {
            sum += (parseInt(feed[i]) * parseInt(cuit[i]));
        }
        digit = 11 - (sum % 11);

        if (digit === 1) {
            digit = 9;
        }
        if (digit === parseInt(cuit[10])) {
            result = true;
        }
    }
    return result;
}

module.exports = cuit;
