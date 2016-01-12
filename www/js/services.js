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
          window.localStorage.removeItem('userid');
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

  }])

  .service('GroupsService', ['$http','$q', function($http, $q) {


    return {

      getChatInfo: getChatInfo

    };

    function getChatInfo () {
      var defered = $q.defer();
      var promise = defered.promise;

      var info = null;
     getGroups().then(function (data) {
         info = data.groups;
         var j = 0;
         var k = 0;
         for( var i = 0; i<info.length; i++){

           getChannels(info[i].id).then(function (data) {
               info[j].publicChannels = data.publicChannels;
               info[j].privateChannels = data.privateChannels;
               j++;
               if(info.length === j && j === k){
                 defered.resolve(info);
               }
             }
             , function (err) {
               // Tratar el error
               defered.reject(err);

             });

           getGroupMembers(info[i].id).then(function (data) {
               info[k].users = data;
               k++;
               if(info.length === k && k === j){
                 defered.resolve(info);
               }
             }
             , function (err) {
               // Tratar el error
               defered.reject(err);

             });

         }
       }
       , function (err) {
         // Tratar el error
         defered.reject(err);

       });

      return promise;
    };

    function getGroups () {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get('http://localhost:3000/api/v1/users/'+window.localStorage.getItem('userid')+'/chat', {
        headers: {'x-access-token': window.localStorage.getItem('token')}
      }).success(function(data) {
        defered.resolve(data);
      })
        .error(function(err, code) {
          err.code = code;
          defered.reject(err);
        });

      return promise;
    };

    function getChannels (groupId) {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get('http://localhost:3000/api/v1/users/'+window.localStorage.getItem('userid')+'/chat/groups/'+groupId, {
        headers: {'x-access-token': window.localStorage.getItem('token')}
      }).success(function(data) {
        //console.log("data");
        //console.log(data);
        defered.resolve(data);
      })
        .error(function(err) {
          defered.reject(err)
        });

      return promise;
    };

    function getGroupMembers (groupId) {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get('http://localhost:3000/api/v1/users/'+window.localStorage.getItem('userid') +'/chat/groups/'+groupId+'/users', {
        headers: {'x-access-token': window.localStorage.getItem('token')}
      }).success(function(data) {
        //console.log("data");
        //console.log(data);
        defered.resolve(data);
      })
        .error(function(err) {
          defered.reject(err)
        });

      return promise;
    }

  }]);
