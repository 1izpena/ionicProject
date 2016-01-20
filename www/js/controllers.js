angular.module('ionicDessiApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, LoginService, SignupService, $ionicPopup, ResetService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    if($scope.message !== undefined){
      showToast($scope.message);
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

.controller('ChatCtrl', function($scope, $state, GroupsService, ChatService, $ionicPopup) {

  $scope.showGroups = true;
  $scope.showChannels = false;
  $scope.showUsers = false;
  $scope.showInvitations = false;
  $scope.groups = 0;
  $scope.messages = null;
  $scope.activeGroup = 0;
  $scope.activeChannel = null;

  $scope.updateActiveGroup = function(i) {
    $scope.activeGroup = i;
  }

  GroupsService.getChatInfo().then(function (data) {
      $scope.groups = data;
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
      $scope.activeChannel = $scope.groups[$scope.activeGroup - 1].privateChannels[index];
    } else {
      $scope.activeChannel = $scope.groups[$scope.activeGroup - 1].publicChannels[index];
    }
    getMessages($scope.activeGroup - 1, index, type);
  }

  function getMessages(groupindex, channelindex, type) {
    if(type === 'public'){
      ChatService.getMessages($scope.groups[groupindex].id, $scope.groups[groupindex].publicChannels[channelindex]).then(function(data){
        $scope.messages = data;
        addMessages(data);
      });
    } else {
      ChatService.getMessages($scope.groups[groupindex].id, $scope.groups[groupindex].privateChannels[channelindex]).then(function (data) {
        $scope.messages = data;
      });
    }
  }

  function addMessages(messages) {
    for(var i = 0; i<messages.data.length; i++) {
      var newMessage = document.createElement('div');
      newMessage.classList.add('item');
      newMessage.classList.add('item-text-wrap');
      var messageText = document.createTextNode(messages.data[i].user.username+': '+messages.data[i].text);
      newMessage.appendChild(messageText);
      document.getElementById('cardList').appendChild(newMessage);
    }
  }

  function addMessage(message) {
    var newMessage = document.createElement('div');
    newMessage.classList.add('item');
    newMessage.classList.add('item-text-wrap');
    var messageText = document.createTextNode(window.localStorage.getItem('username')+': '+message);
    newMessage.appendChild(messageText);
    document.getElementById('cardList').appendChild(newMessage);
  }

  $scope.sendText = function (text) {

    addMessage(text);

    var data = {
      userid: window.localStorage.getItem('userid'),
      groupid: $scope.groups[$scope.activeGroup - 1].id,
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

  $scope.clearMessages = function() {
    var div = document.getElementById('cardList');
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
    $scope.activeChannel = null;
  }

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
              GroupsService.createNewChannel($scope.groups[$scope.activeGroup - 1].id, $scope.newChannel).then(
                function(data) {
                  if(type === 'PUBLIC') {
                    $scope.groups[$scope.activeGroup - 1].publicChannels[$scope.groups[$scope.activeGroup - 1].publicChannels.length] = data.data;
                  } else {
                    $scope.groups[$scope.activeGroup - 1].privateChannels[$scope.groups[$scope.activeGroup - 1].privateChannels.length] = data.data;
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

  function showErrorAlert(message) {
    var alertPopup = $ionicPopup.alert({
      title: 'Error!',
      template: message
    });
  }

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});

function showToast(message) {
  if (window.plugins && window.plugins.toast) {
    window.plugins.toast.showShortCenter(message);
  }
  else $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
}
