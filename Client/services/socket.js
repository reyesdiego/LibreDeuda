/**
 * Created by kolesnikov-a on 20/04/2016.
 */
myApp.service('appSocket', ['socketFactory', 'configService', function(socketFactory, configService) {

    var ioSocket;
    var mySocket;

    return {
        connect: function () {
            ioSocket = io.connect(configService.serverUrl, { transports: ['polling', 'websocket', 'xhr-polling']});
            mySocket = socketFactory({ioSocket: ioSocket});

            mySocket.on('connect', function () {
                //TODO forwrad métodos que devuelve el socket
                mySocket.forward('container');
                //status
                mySocket.forward('status');

            });

            mySocket.on('reconnect', function () {
                //TODO ver si se hace algo acá
            });

            mySocket.on('disconnect', function() {
                //TODO ver que se hace acá
                console.log('socket se desconecto');
            })
        },
        disconnect: function () {
            ioSocket.disconnect();
        },
        emit: function(ev, data){
            mySocket.emit(ev, data);
        }
    }

}]);