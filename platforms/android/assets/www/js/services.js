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

  .service('ResetService', ['$http', 'API_BASE', function($http, API_BASE)
  {
    return {
      check: function(data) {
        return $http({
          method: 'POST',
          url: API_BASE+'api/v1/auth/forget',
          data: {mail: data.mail}
        });
      },
      activate: function(token) {
        return $http({
          method: 'POST',
          url: API_BASE+'api/v1/auth/activate',
          data: {token: token}
        });
      },
      reset: function(data,token){
        return $http({
          method:'POST',
          url:API_BASE+'api/v1/auth/reset',
          data: {token: token , password: data.password}
        });
      }
    };
  }])

  .service('GroupsService', ['$http','$q', 'API_BASE', function($http, $q, API_BASE) {


    return {

      getChatInfo: getChatInfo,
      createNewGroup: createNewGroup,
      createNewChannel: createNewChannel,
      getChannels: getChannels
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

      $http.get( API_BASE + 'api/v1/users/'+window.localStorage.getItem('userid')+'/chat', {
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

    function createNewGroup (data) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'post',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups',
        data: data
      }).then(
        function(response) {
          defered.resolve(response);
        },
        function(error){
          defered.reject(error);
        }
      );
      return promise;
    }

    function getChannels (groupId) {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get( API_BASE + 'api/v1/users/'+window.localStorage.getItem('userid')+'/chat/groups/'+groupId, {
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

    function createNewChannel (groupid,data) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'post',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels',
        data: data
      }).then(
        function(response) {
          defered.resolve(response);
        },
        function(error){
          defered.reject(error);
        }
      );
      return promise;
    }

    function getGroupMembers (groupId) {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get( API_BASE + 'api/v1/users/'+window.localStorage.getItem('userid') +'/chat/groups/'+groupId+'/users', {
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

  }])

  .service('ChatService', ['$http', '$q', 'API_BASE',
    function($http, $q, API_BASE) {

      return {
        uploadFileS3: uploadFileS3,
        postMessage: postMessage,
        getMessages: getMessages,
        getInvitations: getInvitations
      };

      function uploadFileS3 (data) {
        var defered = $q.defer();
        var promise = defered.promise;

        // getSignedUrl para subir fichero a AWS S3
        $http({
          method: 'post',
          url: API_BASE + 'api/v1/file/getSignedUrl',
          headers: {
            'x-access-token': window.localStorage.getItem('token')
          },
          data: {
            'groupid': data.groupid,
            'channelid': data.channelid,
            'filename': data.file.name
          }
        }).then( function(response){
            // Put del fichero en AWS S3
            $http({
              method: 'put',
              url: response.data.url,
              headers: {
                'x-access-token': window.localStorage.getItem('token'),
                'Content-Type': data.file.type
              },
              data: data.file
            }).then(function(response){
                defered.resolve(response);
              },
              function (err) {
                defered.reject(err);
              });
          },
          function (err) {
            defered.reject(err);
          });

        return promise;
      }

      function postMessage (data) {
        var defered = $q.defer();
        var promise = defered.promise;

        var userid=data.userid;
        var groupid=data.groupid;
        var channelid=data.channelid;

        $http({
          method: 'post',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/messages',
          data: data
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );

        return promise;
      }

      function getMessages (groupId, channel) {
        var defered = $q.defer();
        var promise = defered.promise;

        var userid = window.localStorage.getItem('userid');
        var groupid = groupId;
        var channelid = channel.id;

        $http({
          method: 'get',
          url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/messages',
          headers: { 'x-access-token': window.localStorage.getItem('token') },
        }).then( function(result){
            defered.resolve(result);
          },
          function (err) {
            defered.reject(err);
          });
        return promise;
      }

      function getInvitations () {
        var defered = $q.defer();
        var promise = defered.promise;

        $http.get('http://localhost:3000/api/v1/users/'+window.localStorage.getItem('userid') +'/chat/invitations', {
          headers: {'x-access-token': window.localStorage.getItem('token')}
        }).success(function(data) {
          defered.resolve(data);
        })
          .error(function(err) {
            defered.reject(err)
          });

        return promise;
      }
    }])
  .factory('responseHandler', ['$q', '$injector', function($q, $injector, $state) {
    var responseHandler = {
      responseError: function(response) {
        // Session has expired
        if (response.status == 419){
          var state = $injector.get('$state');

          window.localStorage.removeItem('userid');
          window.localStorage.removeItem('username');
          window.localStorage.removeItem('token');
          state.go('home', {message:response.data.message});

        }
        return $q.reject(response);
      }
    };
    return responseHandler;
  }]);
