angular.module('ionicDessiApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, LoginService, SignupService, $ionicPopup, ResetService, $stateParams, $ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    if($stateParams.message !== null){
      showToast($stateParams.message, $ionicLoading);
    }

    if(LoginService.isLogged()){
      $state.go('chat.channel');
    }

    if($scope.message !== undefined) {
      showToast($scope.message);
    }

  // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.loginmodal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.loginmodal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.loginmodal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function(user) {

      $scope.message = '';
      $scope.error = 0;
      if (user.mail && user.password) {
        LoginService.login(user).then(function(res) {
          window.localStorage.setItem('username', res.data.username);
          window.localStorage.setItem('token', res.data.token);
          window.localStorage.setItem('userid', res.data.id);
          $scope.loginmodal.hide();
          $state.go('chat.channel');
        }, function(res) {
          showAlert(res.data.message);
        });
      }

    };

    function showAlert(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Error!!',
        template: message
      })
    };


    // Modal para signup
    $scope.signupData = {};

    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.signupmodal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeSignup = function() {
      $scope.signupmodal.hide();
    };

    // Open the login modal
    $scope.signup = function() {
      $scope.signupmodal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doSignup = function(user) {
      $scope.message = '';
      $scope.error = 0;
      if (user.mail && user.username && user.password) {
        SignupService.signup(user).then(function(res) {
          $scope.signupmodal.hide();
          $scope.loginmodal.show();
          showToast('Signed up succesfully!! Check your email to activate your account');
        }, function(res) {
          showAlert(res.data.message);
        });
      }
    };

    $scope.forgotPassword = function() {
      $scope.data = {};
      $ionicPopup.show({
        template: '<input type="text" placeholder="Email" ng-model="data.mail">',
        title: 'Forgot password',
        subtitle: 'Enter your mail in order to remember your password',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.mail) {
                showErrorAlert('Email is required');
              } else {
                ResetService.check($scope.data).then(function(res)
                {
                  if(window.localStorage.getItem('ResetToken') !=null)
                  {
                    delete window.localStorage.removeItem('ResetToken');
                  }

                  window.localStorage.setItem('ResetToken', res.data);

                },function(res)
                {
                  showAlert(res.data.message);
                });
              }
            }
          }
        ]
      });
    }


})

.controller('ChatCtrl', function($scope, $state, GroupsService, ChatService, $ionicPopup, Socket, $ionicScrollDelegate, $ionicLoading) {

  $scope.username = window.localStorage.getItem('username');
  $scope.showGroups = true;
  $scope.showChannels = false;
  $scope.showUsers = false;
  $scope.showInvitations = false;
  $scope.groups = 0;
  $scope.messagess = [];
  $scope.activeGroup = -1;
  $scope.activeChannel = null;
  $scope.users = {};

  // Emitimos evento de conexion a chat para recibir nuevas invitaciones a grupos
  Socket.emit('newChatConnection', {'userid':window.localStorage.getItem('userid')});

  $scope.updateActiveGroup = function(i) {
    $scope.activeGroup = i;
    if(i !== -1) {
      // Emitimos evento de selecion de grupo para notificaciones de usuarios coenctados al grupo
      Socket.emit('selectGroup', {
        'groupid': $scope.groups[$scope.activeGroup].id,
        'userid': window.localStorage.getItem('userid')
      });
    } else {
      $scope.activeChannel = null;
    }
    $scope.messagess = [];
  };

  GroupsService.getChatInfo().then(function (data) {
      $scope.groups = data;
      createConnectedUserList();
    }
    , function (err) {
      // Tratar el error
      console.log("Hay error");
      console.log(err.message);
      if(err.code === 419){
        $scope.logout();
        $state.go('home', {message:err.message}).then();

      } else {
        $scope.error = err.message;
      }

  });

  function createConnectedUserList(){
    var tempList = {};
    for(var i = 0 ; i<$scope.groups.length ; i++){
      for(var j = 0 ; j<$scope.groups[i].users.length ; j++) {
        tempList[$scope.groups[i].users[j].id] = false;
      }
    }
    $scope.users = tempList;
  }

  ChatService.getInvitations().then(function (data) {
      $scope.invitations = data;
    }
    , function (err) {
      $scope.error = err.message;
  });


  $scope.logout = function() {
    window.localStorage.removeItem('username');
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('userid');

    $state.go('home');
  };

  $scope.toggleGroups = function() {
    $scope.showGroups = !$scope.showGroups;
  }

  $scope.toggleChannels = function() {
    $scope.showChannels = !$scope.showChannels;
  }

  $scope.unhideChannels = function(cond) {
    $scope.showChannels = cond;
  }

  $scope.toggleUsers = function() {
    $scope.showUsers = !$scope.showUsers;
  }

  $scope.unhideUsers = function(cond) {
    $scope.showUsers = cond;
  }

  $scope.selectChannel = function(index, type){
    if(type === 'private') {
      $scope.activeChannel = $scope.groups[$scope.activeGroup].privateChannels[index]
      // Emitimos evento de selecion de canal para recibir nuevos mensajes
      Socket.emit('selectChannel', { 'channelid': $scope.groups[$scope.activeGroup].privateChannels[index].id } );
    } else {
      $scope.activeChannel = $scope.groups[$scope.activeGroup].publicChannels[index];
      // Emitimos evento de selecion de canal para recibir nuevos mensajes
      Socket.emit('selectChannel', { 'channelid': $scope.groups[$scope.activeGroup].publicChannels[index].id } );
    }
    getMessages($scope.activeGroup, index, type);
  }

  function getMessages(groupindex, channelindex, type) {

    if(type === 'public'){
      ChatService.getMessages($scope.groups[groupindex].id, $scope.groups[groupindex].publicChannels[channelindex]).then(function(data){
        $scope.messagess = data.data;

        //addMessages(data);
      });
    } else {
      ChatService.getMessages($scope.groups[groupindex].id, $scope.groups[groupindex].privateChannels[channelindex]).then(function (data) {
        $scope.messagess = data.data;
        //addMessages(data);
      });
    }

  }

  $scope.$on('messageRenderCallback', function(messageRenderCallbackEvent) {
    $ionicScrollDelegate.$getByHandle('messageScroll').scrollBottom(true);
  });

  function addMessages(messages) {
    for(var i = 0; i<messages.data.length; i++) {
      var messageContainer = document.createElement('div');
      messageContainer.classList.add('list');
      messageContainer.classList.add('card');
      var newMessage = document.createElement('div');
      newMessage.classList.add('item');
      newMessage.classList.add('item-text-wrap');
      var messageText = document.createTextNode(messages.data[i].user.username+': '+messages.data[i].text);
      newMessage.appendChild(messageText);
      messageContainer.appendChild(newMessage);
      document.getElementById('cardList').appendChild(messageContainer);

      //cotenedor titulo
      var titleItem = document.createElement('div');
      titleItem.classList.add('item');
      titleItem.classList.add('item-text-wrap');
      var messageTextTitle = document.createTextNode(messages.data[i].user.username+': '+messages.data[i].text);
      var subtitle = document.createElement('p');
      var messageTextSubtitle = document.createTextNode(messages.data[i].user.username+': '+messages.data[i].text);
    }
  }

  function addMessage(message) {
    /*
    var newMessage = document.createElement('div');
    newMessage.classList.add('item');
    newMessage.classList.add('item-text-wrap');
    var messageText = document.createTextNode(window.localStorage.getItem('username')+': '+message);
    newMessage.appendChild(messageText);
    document.getElementById('cardList').appendChild(newMessage);
    */
  }

  $scope.sendText = function (text) {

    //addMessage(text);

    //$scope.messagess.push(data);
    if($scope.activeGroup === -1){
      showToast('Seleccione un grupo', $ionicLoading);
    } else {
      if($scope.activeChannel === null){
        showToast('Seleccione un canal', $ionicLoading);
      } else {
        var data = {
          userid: window.localStorage.getItem('userid'),
          groupid: $scope.groups[$scope.activeGroup].id,
          channelid: $scope.activeChannel.id,
          text: text,
          messageType: 'TEXT'
        };

        ChatService.postMessage(data).then(
          function (result) {
            $scope.text = "";
            console.log(result.data);
          },
          function (error) {
            // TODO: Mostrar error
            console.log(error);
          }
        );
      }
    }
  };
/*
  $scope.clearMessages = function() {
    var div = document.getElementById('cardList');
    if (div) {
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
      $scope.activeChannel = null;
    }
  }
*/
  $scope.showNewChannelPopup = function(type) {
    $scope.newChannel = {};

    $ionicPopup.show({
      template: '<input type="text" placeholder="Channel Name" ng-model="newChannel.channelName">',
      title: 'Enter new channel name',
      scope: $scope,
      buttons: [
        {text: 'Cancel'},
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.newChannel.channelName) {
              showErrorAlert('Channel name is required');
            } else {
              $scope.newChannel.channelType = type;
              GroupsService.createNewChannel($scope.groups[$scope.activeGroup].id, $scope.newChannel).then(
                function(data) {
                  if(type === 'PUBLIC') {
                    $scope.groups[$scope.activeGroup].publicChannels[$scope.groups[$scope.activeGroup].publicChannels.length] = data.data;
                  } else {
                    $scope.groups[$scope.activeGroup].privateChannels[$scope.groups[$scope.activeGroup].privateChannels.length] = data.data;
                  }
                },function(err){
                  // Tratar el error
                  showErrorAlert(err);
                }
              );
            }
          }
        }
      ]
    });
  };

  $scope.showNewGroupPopup = function() {
    $scope.data = {};

    $ionicPopup.show({
      template: '<input type="text" placeholder="Group Name" ng-model="data.groupName">',
      title: 'Enter new group name',
      scope: $scope,
      buttons: [
        {text: 'Cancel'},
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.data.groupName) {
              showErrorAlert('Group name is required');
            } else {
              GroupsService.createNewGroup($scope.data).then(
                function(data) {
                  GroupsService.getChannels(data.data.id).then(
                    function(dataChannels) {
                      $scope.groups[$scope.groups.length] = dataChannels;
                    }, function(err) {
                      showErrorAlert(err);
                    }
                  );
                },function(err){
                  // Tratar el error
                  showErrorAlert(err);
                }
              );
            }
          }
        }
      ]
    });
  };

  $scope.showInviteUserPopup = function() {
    $scope.data = {};

    $ionicPopup.show({
      template: '<input type="text" placeholder="User email" ng-model="data.newUser">',
      title: 'Invite new user',
      scope: $scope,
      buttons: [
        {text: 'Cancel'},
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.data.newUser) {
              showErrorAlert('Email is required');
            } else {
              return $scope.data.newUser;
            }
          }
        }
      ]
    });
  };

    $scope.acceptInvitation = function (invitation) {

      ChatService.acceptInvitation(invitation.groupid)
        .then(function (data) {
          $scope.invitations = data.invitations;
          $scope.groups.push(data.groups[data.groups.length-1]);
          GroupsService.getChannels($scope.groups[$scope.groups.length-1].id).then(function(data) {
            $scope.groups[$scope.groups.length-1].publicChannels = data.publicChannels;
            $scope.groups[$scope.groups.length-1].privateChannels = data.privateChannels;
          }, function(err) {

          });

          GroupsService.getGroupMembers($scope.groups[$scope.groups.length-1].id).then(function(data) {
            $scope.groups[$scope.groups.length-1].users = data;
            for(user in data){
              if($scope.users[user.id] === undefined){
                $scope.users[user.id] = false;
              }
            }
          }, function(err) {

          });
        }
        , function (err) {
          // Tratar el error
          console.log("Hay error");
          console.log(err.message);
          $scope.error = err.message;

        });

    };

    $scope.refuseInvitation = function (invitation) {

      ChatService.refuseInvitation(invitation.groupid)
        .then(function (data) {
          $scope.invitations = data.invitations;
        }
        , function (err) {
          // Tratar el error
          console.log("Hay error");
          console.log(err.message);
          $scope.error = err.message;

        });
    };

  function showErrorAlert(message) {
    var alertPopup = $ionicPopup.alert({
      title: 'Error!',
      template: message
    });
  }

  //Gestion de recepcion de sockets

    Socket.on('newMessage', function (data) {
      $scope.messagess.push(data);
      $scope.$apply();
    });

    Socket.on('newUserConnect', function (data) {
      console.log ("newUserConnect: ");
      updateConnectedUser(data.userid);
      $scope.$apply();
    });

    function updateConnectedUser(userid){
      $scope.users[userid] = true;
    }

    Socket.on('usersConnected', function (data) {
      console.log ("usersConnected: ");
      console.log (data);
      if (data.users) {
        for (var i = 0; i < data.users.length; i++) {
          $scope.users[data.users[i]] = true;
        }
        $scope.$apply();
      }
    });

    Socket.on('userDisconnect', function (data) {
      delete $scope.users[data.userid];
      $scope.$apply();
    });


    //recibir evento de invitación a grupo
    Socket.on('newGroupInvitation', function (data) {
      console.log ("newGroupInvitation received from server");
      console.log(data);
      $scope.invitations.push(data);
      $scope.$apply();
    });

    //recibir evento de nuevo canal publico en grupo
    Socket.on('newPublicChannel', function (data) {
      console.log ("newPublicChannel received from server");
      console.log(data);
      $scope.publicChannels.push(data);
      $scope.$apply();
    });

    //recibir evento de nuevo canal privado en grupo
    Socket.on('newPrivateChannel', function (data) {
      console.log ("newPrivateChannel receive from server");
      console.log(data);
      $scope.privateChannels.push(data);
      $scope.$apply();
    });

    //recibir evento de nuevo usuario en grupo
    Socket.on('newMemberInGroup', function (data) {
      console.log ("newMemberInGroup receive from server");
      console.log(data);
      $scope.members.push(data);
      $scope.$apply();
    });

    //recibir evento de usuario eliminado de grupo
    Socket.on('deletedMemberInGroup', function (data) {
      console.log ("deletedMemberInGroup receive from server");
      console.log(data);
      for (i=0;i<$scope.members.length;i++){
        if ($scope.members[i].id == data.id){
          $scope.members.splice(i,1);
          $scope.$apply();
        }
      }
    });

    //recibir evento de nuevo usuario en canal
    Socket.on('newMemberInChannel', function (data) {
      console.log ("newMemberInChannel receive from server");
      console.log(data);
      $scope.channelMembers.push(data);
      $scope.$apply();
    });

    //recibir evento de usuario eliminado de canal
    Socket.on('deletedMemberInChannel', function (data) {
      console.log ("deletedMemberInChannel receive from server");
      console.log(data);
      for (var i=0;i<$scope.channelMembers.length;i++){
        if ($scope.channelMembers[i].id == data.id){
          $scope.channelMembers.splice(i,1);
          $scope.$apply();
        }
      }
    });

    //recibir evento de nombre de grupo editado
    Socket.on('editedGroup', function (data) {
      console.log ("editedGroup receive from server");
      console.log(data);
      for (var i=0;i<$scope.groups.length;i++){
        if ($scope.groups[i].id == data.id){
          $scope.groups[i].groupname = data.groupname;
          $scope.$apply();
        }
      }
    });

    //recibir evento de nombre de canal publico editado
    Socket.on('editedPublicChannel', function (data) {
      console.log ("editedPublicChannel receive from server");
      console.log(data);
      for (var i=0;i<$scope.publicChannels.length;i++){
        if ($scope.publicChannels[i].id == data.id){
          $scope.publicChannels[i].channelName = data.channelName;
          $scope.$apply();
        }
      }
    });

    //recibir evento de nombre de canal privado editado
    Socket.on('editedPrivateChannel', function (data) {
      console.log ("editedPrivateChannel receive from server");
      console.log(data);
      for (var i=0;i<$scope.privateChannels.length;i++){
        if ($scope.privateChannels[i].id == data.id){
          $scope.privateChannels[i].channelName = data.channelName;
          $scope.$apply();
        }
      }
    });

    //recibir evento de canal privado eliminado
    Socket.on('deletedPrivateChannel', function (data) {
      console.log ("deletedPrivateChannelInGroup receive from server");
      console.log(data);
      for (var i=0;i<$scope.privateChannels.length;i++){
        if ($scope.privateChannels[i].id == data){
          $scope.privateChannels.splice(i,1);
          $scope.$apply();
        }
      }
    });

    //recibir evento de canal publico eliminado
    Socket.on('deletedPublicChannel', function (data) {
      console.log ("deletedPublicChannelInGroup receive from server");
      for (var i=0;i<$scope.publicChannels.length;i++){
        if ($scope.publicChannels[i].id == data){
          $scope.publicChannels.splice(i,1);
          $scope.$apply();
        }
      }
    });

    //recibir evento de grupo eliminado
    Socket.on('deletedGroup', function (data) {
      console.log ("deletedGroup receive from server");
      for (var i=0;i<$scope.groups.length;i++){
        if ($scope.groups[i].id == data){
          $scope.groups[i].splice(i,1);
          $scope.$apply();
        }
      }
    });

});

function showToast(message, $ionicLoading) {
  if (window.plugins && window.plugins.toast) {
    window.plugins.toast.showShortCenter(message);
  }
  else $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
}
