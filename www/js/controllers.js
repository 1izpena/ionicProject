angular.module('ionicDessiApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, LoginService, SignupService, $ionicPopup) {

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
          showToast('Signed up succesfully!!');
        }, function(res) {
          showAlert(res.data.message);
        });
      }
    };


})

.controller('ChatCtrl', function($scope, $state, GroupsService) {

  $scope.showGroups = false;
  $scope.showChannels = false;
  $scope.showUsers = false;
  $scope.groups = 0;
  $scope.activeGroup = 0;

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

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});

function showToast(message) {
  if (window.plugins && window.plugins.toast) {
    window.plugins.toast.showShortCenter(message);
  }
  else $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
}
