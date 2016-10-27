/**
 * Created by kolesnikov-a on 08/08/2016.
 */
describe('Controlador de login', function(){

    var $httpBackend, $rootScope;
    var scope, loginCtrl, loginFactory;

    beforeEach(module('htmlTemplates'));
    beforeEach(module('libreDeuda'));

    beforeEach(inject(function($injector, _loginFactory_) {
        loginFactory = _loginFactory_;
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');

        $rootScope = $injector.get('$rootScope');
        var $controller = $injector.get('$controller');
        scope = $rootScope.$new();
        loginCtrl = $controller('loginCtrl', {
            $scope: scope
        });
    }));

    it('asegurar que esté definido el loginCtl', function(){
        expect(loginCtrl).toBeDefined();
    });

    it('asegurar que el $scope defina un usuaria con las propiedades USUARIO y CLAVE', function(){
        expect(scope.user).toBeDefined();
        expect(scope.user.USUARIO).toBeDefined();
        expect(scope.user.CLAVE).toBeDefined();
    });

    it('confirma que se haga la llamada con los parámetros correctos', function(){

        spyOn(loginFactory, 'login');

        scope.user = {
            USUARIO: 'usuario',
            CLAVE: 'clave'
        };
        scope.login();

        expect(loginFactory.login).toHaveBeenCalledWith( {USUARIO: 'usuario', CLAVE: 'clave'}, jasmine.anything());

    });

    it('confirma llamada al servicio http', function(){

        $httpBackend.expectPOST('https://10.10.0.223:8086/login')
            .respond(200, {status: "OK", data: { token: "askdjsgvdkjaghsvkuv" } });

        loginFactory.login({USUARIO: 'PEPE', CLAVE: '123456'}, function(data){
                expect(data.status).toBe('OK');
                expect(data.data.token).toBeDefined();
        });

        $httpBackend.flush();

    })

});