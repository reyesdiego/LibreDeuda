/**
 * Created by kolesnikov-a on 08/08/2016.
 */
describe('filtros de la app', function(){
    beforeEach(module('libreDeuda'));

    var $filter;

    beforeEach(inject(function(_$filter_){
        $filter = _$filter_;
    }));

    describe('filtro containerStatus', function(){

        var containerStatus;

        beforeEach(function(){
            containerStatus = $filter('containerStatus');
        });

        it('Devuelve "Sin definir" cuando "status" no está definido en el objecto', function(){
            expect(containerStatus(undefined)).toBe('Sin definir');
        });

        it('Devuelve "Sin definir" cuando "status" no coincide con ninguno definido en configService', function(){
            expect(containerStatus(58)).toBe('Sin definir');
        });

    });

    describe('filtro containerClass', function(){

        var containerClass;

        beforeEach(function(){
            containerClass = $filter('containerClass');
        });

        it('Devuelve "status-canceled" cuando "status" no está definido', function(){
            expect(containerClass(undefined)).toBe('status-canceled');
        });

        it('Devuelve "status-canceled" cuando "status" no coincide con ninguno definido en configService', function(){
            expect(containerClass(58)).toBe('status-canceled');
        })

    });

    describe('filtro startFrom', function(){

        var startFrom;
        var arrayPrueba = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        beforeEach(function(){
            startFrom = $filter('startFrom');
        });

        it('Con un parametro mayor que 0 y menor que el length del array, debe devolver el array cortado a partir de ese indice', function(){
            var indice = 5;
            expect(startFrom(arrayPrueba, indice)).toContain(5);
            expect(startFrom(arrayPrueba, indice)).toContain(9);
            expect(startFrom(arrayPrueba, indice)).not.toContain(0);
            expect(startFrom(arrayPrueba, indice)).not.toContain(4);
        });

        it('Con un índice mayor al tamaño del array debería devolver un array vacío', function(){
            var indice = 11;
            expect(startFrom(arrayPrueba, indice).length).toBe(0);
        })

    });


});
