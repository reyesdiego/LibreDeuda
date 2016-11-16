/**
 * Created by diego on 24/05/16.
 */

let cuit = (cuit) => {
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
}

module.exports = cuit;
