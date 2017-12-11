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

        // para compartir información general de las canciones  actualizadas de la playlist seleccionada
        app.factory("updateCanciones", function() {
            var songs= {};
            return {
              set: function(value){
                      songs = value;
              },
              get: function(){
                return songs;
              }
            };
        });

        // para compartir información general de las canciones de la playlist seleccionada
        app.factory("completaCanciones", function() {
            var songs= {};
            return {
              set: function(value){
                      songs = value;
              },
              get: function(){
                return songs;
              }
            };
        });



        // para compartir información general de la playlist seleccionada
        app.factory("playl", function() {
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


          // controlador para dar inicio y no mostrar el boton de bienvenida //aun no funciona
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

        // controlador para las listas y con un tiempo de espera para poder funcionar bien 
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

        //controlador para eliminar todas las canciones repetidas
        app.controller("repetidas", function($scope, $http, playl, updateCanciones) {
          $scope.cancionesrepetidas = function () {
            //paraData tiene la construcción de uris
            var paraData = cancionesSinRepetirTodas(updateCanciones.get());

            console.log(paraData);


                  $http({
                    method: "PUT",
                  
                    url: playl.get()+'/tracks',
    
                    headers: {
                            
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                            
                   },
                   data : paraData

              }).then(function(response) { 

                //Aqui mandar un mensaje que fue eliminada las canciones 
                    console.log('hecho ');
                                  
          });
      }
      ;
 });

    

        //Controlador para eliminar la cancion selecionada 
        app.controller("eliminarUno", function($scope, $http, playl, completaCanciones) {
          $scope.eliminaUno = function (numero) {

              
              var canciones = completaCanciones.get();
              var nuevo =  cancionesBuscar(canciones, numero);

                $http({
                    method: "PUT",
                  
                    url: playl.get()+'/tracks',
    
                    headers: {
                            
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                            
                   },
                   data : nuevo

              }).then(function(response) { 

                  
                   //Aqui mandar un mensaje que fue eliminada la cancion seleccionada 
                                  
          });

      };
 });


          // busca las posiciones de las canciones para despues saber cual eliminar 
          // parte del controlador buscar
        function posicionUrisRepetidas(arrayUriSin){


            var pos =[];

            for (var i = 0; i < arrayUriSin.length; i++) {
              if(arrayUriSin[i] != null){
                pos [pos.length]=  i ;
              }

            }
         
            console.log("posiciones ", pos);

            return pos; 

        }


        // Controlador para buscar todas las canciones repetidas de la lista
         app.controller("buscar", function($scope, $rootScope,  updateCanciones) {

    
          $scope.buscarrepetidas = function () {
          var paraDatass         = cancionesSinRepetir(updateCanciones.get());
          var pos                =  posicionUrisRepetidas(paraDatass);
          $rootScope.re          = pos; 
         };
         });



        // controlador para las canciones 
        app.controller("tracks", function($scope, $http,$rootScope, playl, updateCanciones, completaCanciones) { 
            $scope.track = function ( path ) {
              playl.set(path);
		          $http({
                    method: "GET",
                    url:path+'/tracks' ,
                    headers: {
                            'Authorization': 'Bearer ' + access_token
                    }
              }).then(function(response2) {
                    
                       
                          $rootScope.listatrack = response2.data.items;
                          updateCanciones.set(response2.data);
                          completaCanciones.set(response2.data);

                    }) 
            };
        });
                    //verifica el uri, es parte de la funcion cancionesSinRepetir, cancionesSinRepetirTodas
                  function eliminandoDupl(elemento, array_sin) {
                for (j = 0; j < array_sin.length; j++) {
                    if (array_sin[j] == elemento) {
                        return true;
                    }
                }
                return false;
                }


                //llena el array de uris sin formato de PUT
                // es parte de la funcion cancionesSinRepetir, cancionesBuscar y  cancionesSinRepetirTodas
            function llenarArrayUris(data){
              var tamaño = data.items.length;
               var arrayuri = [];
              for (var i = 0; i < tamaño; i++) {
              var j = data.items[i].track.uri;
              arrayuri.push(j);
            }

            return arrayuri;

            }
              //llena la variable con uris en el formato PUT
              //es parte de la funcion cancionesBuscar y cancionesSinRepetirTodas
            function construyendoUri(array_sin){
               var uris = '{"uris":[';

               for (i = 0; i < array_sin.length; i++) {
             uris +=  '"'+array_sin[i]+'"';
                       if ((array_sin.length-1) == i) {
                        uris +="";
                       }else{
                        uris +=",";
                       }
                    }

                     uris +=']}';

                     return uris;



                     console.log("contruyendo ", uris); 

            }

          


            //es la funcion llamada desde el controlador repetidas para enviar las canciones a actualizar
            //sin canciones repetidas  
          function cancionesSinRepetir(data){
           var arrayuri = llenarArrayUris(data);
           var tamaño = arrayuri.length;
           var array_sin = [];
           var array_rep = [];

            for (i = 0; i < tamaño; i++) {
                if (eliminandoDupl(arrayuri[i], array_sin) === false) {
                    array_sin[array_sin.length] = arrayuri[i]

                }else{
                    array_rep[i] = arrayuri[i];
                }

            }
            return array_rep;

            console.log(array_rep);

          }

          //es la funcion llamada desde el controlador repetidas para enviar las canciones a actualizar
          function cancionesSinRepetirTodas(data){
           var arrayuri = llenarArrayUris(data);
           var tamaño = arrayuri.length;
           var array_sin = [];
           var array_rep = [];

            for (i = 0; i < tamaño; i++) {
                if (eliminandoDupl(arrayuri[i], array_sin) === false) {
                    array_sin[array_sin.length] = arrayuri[i]

                }

            }

            var  construUri = construyendoUri(array_sin);
            return construUri;

            

          }


          //es la funcion llamada desde el controlador eliminarUno para enviar las canciones a actualizar
          //dependiendo de las canciones seleccionadas 
           function cancionesBuscar(data, elemento){
           var arrayuri = llenarArrayUris(data);
           var tamaño = arrayuri.length;
           var array_sin = [];
           

            for (i = 0; i < tamaño; i++) {
                if (i != elemento) {
                    array_sin[array_sin.length] = arrayuri[i]

                }

            }

          
            var uris = construyendoUri(array_sin);
            return uris;

          }


        }// final de if
      }

})();