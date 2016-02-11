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
      getGroupMembers: getGroupMembers,
      getChannels: getChannels,
      searchDirectChannel: searchDirectChannel,
      createDirectChannel: createDirectChannel,
      editGroup: editGroup,
      inviteUserToGroup : inviteUserToGroup,
      removeUserFromGroup : removeUserFromGroup,
      unsuscribeFromGroup : unsuscribeFromGroup,
      deleteGroup : deleteGroup,
      editChannel: editChannel,
      addUserToChannel: addUserToChannel,
      deleteUserFromChannel: deleteUserFromChannel,
      unsubscribeFromChannel: unsubscribeFromChannel,
      deleteChannel: deleteChannel
    };

    function getChatInfo () {
      var defered = $q.defer();
      var promise = defered.promise;

      var info = null;
     getGroups().then(function (data) {
         info = data.groups;
         for( var i = 0; i<info.length; i++){


          /*
           getChannels(info[i].id).then(function (data) {

               //info[j].publicChannels = data.publicChannels;
               //info[j].privateChannels = data.privateChannels;
               //j++;
               //if(info.length === j && j === k){
               //  defered.resolve(info);
               //}

               for(var j = 0 ; j<info.length ; j++) {
                 if(info[j].id === data.id) {
                   info[j].publicChannels = data.publicChannels;
                   info[j].privateChannels = data.privateChannels;
                   break;
                 }
               }
               //defered.resolve(info);
             }
             , function (err) {
               // Tratar el error
               defered.reject(err);

             });
           */
           /*
           getGroupMembers(info[i].id).then(function (data) {
               info[k].users = data;
               k++;
               if(info.length === k){
                 defered.resolve(info);
               }
             }
             , function (err) {
               // Tratar el error
               defered.reject(err);

             });
            */
           var k = 0;
           getGroupInfo(info[i].id).then(function (data) {
               for(var j = 0 ; j<info.length ; j++) {
                 if(info[j].id === data.id) {
                   info[j] = data;
                   k++;
                   break;
                 }
               }
               if(k == info.length) {
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

    function getGroupInfo (groupid) {
      var defered = $q.defer();
      var promise = defered.promise;

      $http.get( API_BASE + 'api/v1/users/'+window.localStorage.getItem('userid')+'/chat/groups/'+groupid, {
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

    function searchDirectChannel(userid, member, directChannels) {

      var directChannel = null;
      var userid1, userid2;
      var channel;
      for (var i=0; i < directChannels.length; i++) {
        channel = directChannels[i];
        if (channel.users.length == 2) {
          userid1 = channel.users[0];
          userid2 = channel.users[1];

          if ((userid1 == userid && userid2 == member.id) ||
            (userid1 == member.id && userid2 == userid)) {
            directChannel = channel;
            break;
          }
        }
      }

      return directChannel;
    }

    function createDirectChannel(userid, username, user2, groupid) {
      var defered = $q.defer();
      var promise = defered.promise;

      var data = {
        'channelName': username + '-'+ user2.username,
        'channelType': 'DIRECT',
        'secondUserid' : user2.id
      };

      $http({
        method: 'post',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels',
        data: data
      }).then(
        function(response) {
          defered.resolve(response.data);
        },
        function(error){
          defered.reject(error);
        }
      );
      return promise;
    }

    function editGroup (groupid,data2) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');

      $http({
        method: 'put',
        headers: {'x-access-token': window.localStorage.getItem('token'), 'Content-Type': 'application/x-www-form-urlencoded'},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid,
        data: 'groupName='+data2

      }).success(function(data) {
        defered.resolve(data);
      })
        .error(function(err) {
          defered.reject(err)
        });

      return promise;
    };

    function inviteUserToGroup (user, group) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'post',
        headers: {'x-access-token': window.localStorage.getItem('token'), 'Content-Type': 'application/x-www-form-urlencoded'},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+group.id+'/users/'+user.id+'/invite'
      }).then(
        function(response) {
          defered.resolve(response);
        },
        function(error){
          defered.reject(error);
        }
      );
      return promise;
    };



    function removeUserFromGroup (user, group) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token'), 'Content-Type': 'application/x-www-form-urlencoded'},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+group.id+'/users/'+user.id
      }).then(
        function(response) {
          defered.resolve(response);
        },
        function(error){
          defered.reject(error);
        }
      );
      return promise;
    };

    function unsuscribeFromGroup (groupid) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');

      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/unsuscribe'

      }).success(function(data) {
        defered.resolve(data);
      })
        .error(function(err) {
          defered.reject(err)
        });

      return promise;
    };

    function deleteGroup (groupid) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');

      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid

      }).success(function(data) {
        defered.resolve(data);
      })
        .error(function(err) {
          defered.reject(err)
        });

      return promise;
    };

    function editChannel (groupid,channelid,data) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'put',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid,
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

    function addUserToChannel (groupid,channelid,userAdd) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      var userid1 = userAdd;
      $http({
        method: 'post',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/users/'+userid1,
        data: ''
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

    function deleteUserFromChannel (groupid,channelid,data) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      var userid1 = data;
      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/users/'+userid1,
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

    function unsubscribeFromChannel (groupid,channelid) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/unsuscribe/'
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

    function deleteChannel (groupid,channelid) {
      var defered = $q.defer();
      var promise = defered.promise;
      var userid = window.localStorage.getItem('userid');
      $http({
        method: 'delete',
        headers: {'x-access-token': window.localStorage.getItem('token')},
        url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid
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

  }])

  .service('ChatService', ['$http', '$q', 'API_BASE',
    function($http, $q, API_BASE) {

      return {
        uploadFileS3: uploadFileS3,
        postMessage: postMessage,
        getMessages: getMessages,
        getInvitations: getInvitations,
        acceptInvitation: acceptInvitation,
        refuseInvitation: refuseInvitation,
        getSystemUsers : getSystemUsers,
        postAnswer: postAnswer
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

      function acceptInvitation (groupId) {
        var defered = $q.defer();
        var promise = defered.promise;
        var userid = window.localStorage.getItem('userid');

        $http({
          method: 'post',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE+'api/v1/users/'+userid+'/chat/invitations/'+groupId
        }).success(function(data) {
          defered.resolve(data);
        })
          .error(function(err) {
            defered.reject(err)
          });

        return promise;


      }

      function refuseInvitation (groupId) {
        var defered = $q.defer();
        var promise = defered.promise;
        var userid = window.localStorage.getItem('userid');

        $http({
          method: 'delete',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE+'api/v1/users/'+userid+'/chat/invitations/'+groupId
        }).success(function(data) {
          defered.resolve(data);
        })
          .error(function(err) {
            defered.reject(err)
          });

        return promise;

      };

      function getSystemUsers () {

        var defered = $q.defer();
        var promise = defered.promise;

        $http.get(API_BASE + 'api/v1/users/', {
          headers: {'x-access-token': window.localStorage.getItem('token')}
        }).success(function(data) {
          defered.resolve(data);
        })
          .error(function(err) {
            defered.reject(err)
          });

        return promise;
      }

      function postAnswer (data) {
        var defered = $q.defer();
        var promise = defered.promise;

        var userid=data.userid;
        var groupid=data.groupid;
        var channelid=data.channelid;
        var messageid=data.messageid;

        $http({
          method: 'post',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/users/'+userid+'/chat/groups/'+groupid+'/channels/'+channelid+'/messages/'+messageid+'/answer',
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

    }])

  //FORO
  .service('ForumService', ['$http','$q', 'API_BASE',
    function($http, $q,API_BASE){

      return{
        getQuestions: getQuestions,
        createQuestion: createQuestion,
        getQuestion: getQuestion,
        commentQuestion: commentQuestion,
        questionUpVote: questionUpVote,
        questionDownVote: questionDownVote,
        getTags: getTags,
        newAnswer: newAnswer,
        answerUpVote: answerUpVote,
        answerDownVote: answerDownVote,
        commentAnswer: commentAnswer,
        deleteAnswer: deleteAnswer
      };

      function getQuestions() {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'get',
          url: API_BASE + 'api/v1/forum/questions',
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function createQuestion(data)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        var nowDate = new Date().getTime();
        $http({
          method: 'post',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/',
          data:{
            "title" : data.title,
            "body"  : data.body,
            "created": nowDate,
            "answercount" : 0,
            "votes" : 0,
            "views" : 0,
            "tags":  data.tags
          }
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };
      function getQuestion(questionId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'get',
          url: API_BASE + 'api/v1/forum/question/'+ questionId,
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };
      function commentQuestion(questionId, data)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        var nowDate = new Date().getTime();
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/comment",
          data: {
            'comment': data,
            'questionid': questionId,
            'created': nowDate,
          }
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };
      function questionUpVote(questionId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/upvote",
          data:{
            "questionid": questionId,
            "vote": 1
          }
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };
      function questionDownVote(questionId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/downvote",
          data:{
            "questionid": questionId,
            "vote": -1
          }
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };


      function getTags()
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'get',
          url: API_BASE + 'api/v1/forum/tags',
        }).then(
          function(response) {
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function newAnswer(questionId,data)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        var nowDate = new Date().getTime();
        $http({
          method: 'post',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/answer",
          data:{
            "body"      : data.body,
            "created"   : nowDate,
            "votes"     : 0
          }
        }).then(
          function(response){
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function commentAnswer(questionid,answerid,data)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        var nowDate = new Date().getTime();
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionid+ "/answer/"+ answerid+'/comment',
          data:{
            "comment"      : data,
            "created"   : nowDate,
          }
        }).then(
          function(response){
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function answerUpVote(questionId,answerId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/answer/"+answerId+'/upvote',
          data:{
            "vote"      : 1,
          }
        }).then(
          function(response){
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function answerDownVote(questionId,answerId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'put',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/answer/"+answerId+'/downvote',
          data:{
            "vote"      : -1,
          }
        }).then(
          function(response){
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

      function deleteAnswer(questionId,answerId)
      {
        var defered = $q.defer();
        var promise = defered.promise;
        $http({
          method: 'delete',
          headers: {'x-access-token': window.localStorage.getItem('token')},
          url: API_BASE + 'api/v1/forum/question/'+ questionId+ "/answer/"+answerId+'/delete',
        }).then(
          function(response){
            defered.resolve(response);
          },
          function(error){
            defered.reject(error);
          }
        );
        return promise;
      };

    }])

  .factory('Socket', ['API_BASE', function(API_BASE) {
    return io.connect(API_BASE);
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
  }])

  //DIRECTIVES
  .directive('onFinishRender', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('messageRenderCallback');
          });
        }
      }
    }
  });
