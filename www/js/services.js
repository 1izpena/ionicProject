/**
 * Created by urtzi on 21/12/2015.
 */
'use strict';


angular.module('ionicDessiApp')
  .service('LoginService', ['$http', '$state', 'API_BASE', function($http, $state, API_BASE)
  {
    return {
      login: function(data) {
        return $http({
          method: 'POST',
          url: API_BASE +'api/v1/auth/login',
          data: {mail: data.mail, password: data.password}
        });
      },
      logout: function() {
        if(window.localStorage.getItem('username') !== null){
          window.localStorage.removeItem('username');
          window.localStorage.removeItem('token');
          $location.path('/');
        }
      },
      isLogged: function() {
        if(window.localStorage.getItem('username') !== null && window.localStorage.getItem('token') !== null){
          return true;
        }
        return false;
      }
    };

  }])
  .service('SignupService', ['$http', '$state', 'API_BASE', function($http, $state, API_BASE)
  {
    return {
      signup: function (data) {
        return $http({
          method: 'POST',
          url: API_BASE + 'api/v1/auth/signup',
          data: {mail: data.mail, username: data.username, password: data.password}
        });
      }
    };

  }]);
