/**
 * Created by diego on 10/11/16.
 */

'use strict';

var errors = [
    {code: `MONGO-ERROR`, message: `Error en base de datos`, http_status: 500},
    {code: `AGP-0001`, message: `Libre deuda inexistente para este contenedor.`, http_status: 409},
    {code: `AGP-0002`, message: `Libre deuda vencido para este contenedor.`, http_status: 409},
    {code: `AGP-0003`, message: `Libre deuda anulado para este contenedor.`, http_status: 409},
    {code: `AGP-0004`, message: `CUIT inválido.`, http_status: 400},
    {code: `AGP-0005`, message: `Libre deuda yá existe para este contenedor.`, http_status: 409},
    {code: `AGP-0006`, message: `La fecha no puede ser menor a la fecha de hoy.`, http_status: 409},
    {code: `AGP-0007`, message: `La nueva fecha de devolución debe ser menor a la fecha de devolución vigente.`, http_status: 409},
    {code: `AGP-0008`, message: `No tiene privilegios para realizar esta petición.`, http_status: 401}
];
//module.exports.errors = errors;

var getError = code => {
    var result;
    result = errors.filter(item => {
        if (item.code === code) {
            return true;
        }
    });
    return result[0];
}
//module.exports.getError = getError;

var ERROR = code => {
    let err = getError(code);
    this.status = 'ERROR';
    this.code = '';
    this.message = '';
    this.http_status = 500;

    if (err) {
        this.code = err.code;
        this.message = err.message;
        this.http_status = err.http_status;
        this.data = (data => {
            this.data = data;
            return this;
        });
    }
    return this;
};
module.exports.ERROR = ERROR;
