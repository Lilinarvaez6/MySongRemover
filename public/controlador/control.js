(function() {
function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
               q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
        }
          return hashParams;
    }

        var params = getHashParams();

        var access_token  = params.access_token,
            refresh_token = params.refresh_token,
            error         = params.error;


     
        if (error) {
          alert('¡Hubo un error durante la autenticación!');
        } else {
        if (access_token) {

             var app = angular.module("spotify", []);

        // para compartir el dato id del usuario
        app.factory("datos", function() {
            var id= 'default';
            return {
              set: function(value){
                      id = value;
              },
              get: function(){
                return id;
              }
            };
        });

          // controlador para dar inicio y no mostrar el boton de bienvenida 
          app.controller("iniciando", function($scope) {
           $scope.inicio = false;
           $scope.c = true;
           
          $scope.r = function(){
              $scope.inicio = true;
               
            }
             
        });
        
        

        // controlador para los datos personales
        app.controller("perfil", function($scope, $http, datos) {
            $http({
          				method: "GET",
                  url: 'https://api.spotify.com/v1/me',
                  headers: {
                          'Authorization': 'Bearer ' + access_token
                          }
            }).then(function(response) {
					         var _id = response.data.id;
            			 datos.set(_id);
            	     $scope.data = response.data;
              });
        });

        // controlador para las listas 
        app.controller("playlist", function($scope, $http, datos,  $timeout) {
            $timeout(function(){
				      $http({
                    method: "GET",
                    url: 'https://api.spotify.com/v1/users/'+datos.get()+'/playlists',
                    headers: {
                            'Authorization': 'Bearer ' + access_token
                   }
            	}).then(function(response) {  
                		$scope.lista = response.data.items;
                  });
			}, 1000);
			});

        // controlador para las canciones 
        app.controller("tracks", function($scope, $http,$rootScope) { 
            $scope.track = function ( path ) {
		          $http({
                    method: "GET",
                    url:path+'/tracks' ,
                    headers: {
                            'Authorization': 'Bearer ' + access_token
                    }
              }).then(function(response2) {
                    $rootScope.listatrack = response2.data.items;
                    }) 
            };
        });

        }// final de if
      }

})();