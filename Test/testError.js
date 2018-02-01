/**
 * Created by diego on 10/11/16.
 */

var Error = require('../include/error.js');
//console.log(Error.errors);

//var error = Error.getError("AGP-0001");
//console.log(error);

//var err = Error.ERROR("AGP-0001");
//console.log(err);

err = Error.ERROR("AGP-0001");
console.log(err);

err = Error.ERROR("AGP-0001").data();
console.log(err);

err = Error.ERROR("AGP-0001").data("jj");
console.log(err);
