/**
 * Created by kolesnikov-a on 04/05/2016.
 */
myApp.service('Session', ['$rootScope', 'storageService', '$http', 'configService', 'AUTH_EVENTS', '$q', function($rootScope, storageService, $http, configService, AUTH_EVENTS, $q){

    class Session {
        constructor(){
            this.data = {
                USUARIO: '',
                CLAVE: '',
                TYPE: 'full',
                keep: false
            };

            if (storageService.getKey('token') !== null){
                this.reloadData(true);
            }
            if (storageService.getSessionKey('token') !== null){
                this.reloadData(false)
            }
        }

        login(){
            const deferred = $q.defer();
            const inserturl = `${configService.serverUrl}/login`;

            $http.post(inserturl, this.data).then((response) => {
                $rootScope.$broadcast(AUTH_EVENTS.loginSucces);
                //console.log(response.data.data);
                this.userData = response.data.data;
                this.token = response.data.data.token;
                deferred.resolve(response);
            }, (response) => {
                deferred.reject(response);
            });
            return deferred.promise;
        }

        keepAlive(){
            const deferred = $q.defer();
            const inserturl = `${configService.serverUrl}/login`;

            let param = {
                USUARIO: this.data.USUARIO,
                CLAVE: this.data.CLAVE
            };

            $http.post(inserturl, param).then((response) => {
                this.token = response.data.data;
                deferred.resolve();
            }, (response) => {
                deferred.reject(response);
            });
            return deferred.promise;
        }

        reloadData(keep){
            let user = null;
            if (keep){
                user = storageService.getObject('user');
            } else {
                user = storageService.getSessionObject('user');
            }
            //console.log(user);
            angular.extend(this.data, user);
            this.data.keep = keep;
        }

        set token(token){
            if (this.data.keep){
                storageService.setKey('token', token);
            } else {
                storageService.setSessionKey('token', token);
            }
        }

        get token(){
            if (this.data.keep){
                return storageService.getKey('token');
            } else {
                return storageService.getSessionKey('token');
            }
        }

        set userData(userData){
            //angular.extend(this.data, userData);
            //this.data.full_name = userData.full_name;
            this.data.firstname = userData.firstname;
            this.data.lastname = userData.lastname;
            this.data.token = userData.token;
            this.data.group = userData.group;
            if (this.data.keep){
                storageService.setObject('user', this.data);
            } else {
                storageService.setSessionObject('user', this.data);
            }
        }

        get name(){
            return this.data.USUARIO;
        }

        get fullName(){
            return this.data.firstname + ' ' + this.data.lastname;
        }

        get isAuthenticated(){
            return (this.token !== null);
        }

        isAuthorized(authorizedRoles){
            return (this.isAuthenticated &&
                (authorizedRoles.indexOf(this.data.group) !== -1 || authorizedRoles.indexOf('*') !== -1));
        }

        logOut(){
            if (this.data.keep){
                storageService.deleteKey('user');
                storageService.deleteKey('token');
            } else {
                storageService.deleteSessionKey('user');
                storageService.deleteSessionKey('token');
            }
        }
    }

    return new Session();

}]);