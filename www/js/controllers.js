angular.module('ionicDessiApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, LoginService, SignupService, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    if(LoginService.isLogged()){
      $state.go('chat');
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
          $scope.loginmodal.hide();
          $state.go('chat');
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

    function showToast(message) {
      if (window.plugins && window.plugins.toast) {
        window.plugins.toast.showShortCenter(message);
      }
      else $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
    }
})

.controller('ChatCtrl', function($scope, $state) {
  $scope.logout = function() {
    window.localStorage.removeItem('username');
    window.localStorage.removeItem('token');
    $state.go('home');
  }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
