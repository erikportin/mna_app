angular.module('mna')
    .controller('ResultCtrl', function($scope, $q, $ionicPlatform, $ionicModal, $timeout, Albums, Settings) {
    var vm = this,
        _isDevice = false;        
    vm.album = null;
    vm.error = '';
    vm.isLoading = true;
           
    function success(data){
        console.log('success')
        console.table(data)
        console.timeEnd('getNextAlbum');

        vm.album = data;
        vm.error = '';
        vm.isLoading = false;

    }
    
    function error(error){
        console.log(error)
        console.timeEnd('getNextAlbum');        

        vm.album = null;
        vm.error = error;
        vm.isLoading = false;
       
    }
       
    vm.getNextAlbum = function(shouldRefreshData){
        console.log('Try getting Album')
        console.time('getNextAlbum');
        vm.isLoading = true;
        vm.error = '';
        vm.album = null;
        
        Albums.getNextAlbum(shouldRefreshData)
            .then(success, error)
            .finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });       
    };
    
    $ionicModal.fromTemplateUrl('templates/settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        vm.modal = modal;
    });
    
    vm.showSettings = function () {
       vm.modal.show();
    };
    
    vm.hideSettings = function () {
        vm.modal.hide();
    };

    vm.preferenceChanged = function(){
        console.log('Preferences changed')
        console.log(vm.preferences)

        $q.all(vm.preferences.map(function(pref){
            return Settings.setPreferences(pref.text, pref.checked ? 1 : 0)
        })).then(function(preferences){
            console.log(preferences)
            vm.preferences = preferences[0].map(function(pref){
                pref.checked = pref.checked ? true : false;
                return pref
            });

        })    
    }

    vm.deleteIgnoreListItem = function(id){
        console.log("deleteIgnoreListItem", id)
        Settings.deleteIgnoreListItem(id).then(function(ignore){
            vm.ignore = ignore
        });
    }

    vm.addIgnoreListItem = function(id, name){
        Settings.addIgnoreListItem(id, name).then(function(ignore){
            vm.ignore = ignore
        });
    }
    
    //init       
    document.addEventListener('deviceready', function () {
        _isDevice = true;
        vm.getNextAlbum();
        Settings.getIgnoreList().then(function(ignore){
            console.log(ignore)
            vm.ignore = ignore
        });
        Settings.getPreferences().then(function(preferences){
            console.log(preferences)
            vm.preferences = preferences.map(function(pref){
                pref.checked = pref.checked ? true : false;
                return pref
            });
        });
    }, false);
    
    $timeout(function(){
        if(!_isDevice){
            vm.getNextAlbum();
        }
    }, 2000)  
})
