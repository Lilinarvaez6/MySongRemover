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

             var app = angular.module("spotify", ['toastr']);


            app.controller('TabController', function($scope) {
                  $scope.tab = 1;

                  $scope.setTab = function(newTab){
                    $scope.tab = newTab;
                  };

                  $scope.isSet = function(tabNum){
                    return $scope.tab === tabNum;
                  };
              });

             /*$("#alert-target").click(function () {
                toastr["info"]("I was launched via jQuery!")
              });*/

/*              app.controller('foo', function($scope, toastr) {
                toastr.success('Hello world!', 'Toastr fun!');
              });*/

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


        app.factory("tamano", function() {
            var tamano = 0;
            return {
              set: function(value){
                      tamano = value;
              },
              get: function(){
                return tamano;
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

                    console.log("playlist ", response.data.items);
                  });
			}, 2000);
			});

        //controlador para eliminar todas las canciones repetidas
        app.controller("repetidas", function($scope, $http, playl, updateCanciones,  toastr, completaCanciones, tamano) {
          $scope.cancionesrepetidas = function () {
            //paraData tiene la construcción de uris
            var paraData = cancionesSinRepetirTodas(updateCanciones.get());
            var complet = completaCanciones.get();
            console.log("es vacio ", paraData);

            console.log("completa ",complet);


                  $http({
                    method: "PUT",
                  
                    url: playl.get()+'/tracks',
    
                    headers: {
                            
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                            
                   },
                   data : paraData

              }).then(function(response) { 
                   
                var mensaje = tamano.get();
                console.log("tamaño de las lista de canciones ",mensaje);
                if(mensaje != 0){
                //Aqui mandar un mensaje que fue eliminada las canciones 
                toastr.success('Se eliminaron las canciones exitosamente', 'Notificacion');
              }else{
                toastr.error('No se encuentran canciones repetidas', 'Notificacion');
              }
                                  
          });
      }
      ;
 });

    

        //Controlador para eliminar la cancion selecionada 
        app.controller("eliminarUno", function($scope, $http, playl, completaCanciones) {
          $scope.eliminaUno = function (numero) {

              
              var canciones = completaCanciones.get();
              var nuevo =  cancionesBuscar(canciones, numero);
                    console.log("eliminarUno  canciones", canciones);
                    console.log("eliminarUno nuevo", nuevo);


                $http({
                    method: "PUT",
                  
                    url: playl.get()+'/tracks',
    
                    headers: {
                            
                            'Authorization': 'Bearer ' + access_token,
                            'Content-Type': 'application/json'
                            
                   },
                   data : nuevo

              }).then(function(response) { 

                 // toastr.success('Cancion eliminada exitosamente', 'Notificacion');
                                  
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
         
            console.log("posicionUrisRepetidas posiciones ", pos);

            return pos; 

        }


        // Controlador para buscar todas las canciones repetidas de la lista
         app.controller("buscar", function($scope, $rootScope,  updateCanciones, tamano) {

    
          $scope.buscarrepetidas = function () {
          var paraDatass         = cancionesSinRepetir(updateCanciones.get());
          var pos                =  posicionUrisRepetidas(paraDatass);
          $rootScope.re          = pos; 

          var tamanos = paraDatass.length;

          tamano.set(tamanos);

            console.log("buscar paraDatass ", paraDatass);
            console.log("buscar pos ", pos);



         };
         });



        // controlador para las canciones 
        app.controller("tracks", function($scope, $http,$rootScope, playl, updateCanciones, completaCanciones) { 
            $scope.track = function ( path ) {
              playl.set(path);

            console.log("tracks path ", path);

		          $http({
                    method: "GET",
                    url:path+'/tracks' ,
                    headers: {
                            'Authorization': 'Bearer ' + access_token
                    }
              }).then(function(response2) {
                    
                        console.log("tracks response2 ", response2);
                       
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
            console.log("llenarArrayUris ", arrayuri);
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

                     console.log("contruyendo ", uris);

                     return uris;



                      

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
            console.log("cancionesSinRepetir array_rep ",array_rep);
            return array_rep;

            

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

            console.log("cancionesSinRepetirTodas ",array_sin);
            var  construUri = construyendoUri(array_sin);
            console.log("cancionesSinRepetirTodas construUri ",construUri);
            
            

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

            
            console.log("cancionesBuscar array_sin ",array_sin);
          
            var uris = construyendoUri(array_sin);
            console.log("cancionesBuscar uris ",uris);
            return uris;

          }


        }// final de if
      }

})();