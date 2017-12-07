//lo que se necesita 
var express = require('express'); 
var request = require('request'); 
var querystring = require('querystring');
var cookieParser = require('cookie-parser');



/*// conexion con mongoose  y llamada al Schema
var mongoose = require('mongoose');
const Reporte = require('./models/reporte');
mongoose.connect('mongodb://localhost/mysongs', (err, res) =>{
  if (err) throw err
    console.log('conexion a la base de datos establecida')
});
*/




/*var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});
*/

// // conexion con base de datos pg
//var pg = require("pg");
//var connectionString = "postgres://postgres:postgres@localhost:5432/mysongs";



//lo de la aplicacion de Spotify
var client_id = '956f9a50e95e4b888f59e45e27f6615e'; 
var client_secret = '02d287a741f440d189d4a99a5064c379'; 
var redirect_uri = 'http://localhost:8888/callback'; 

//random de string
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();




//direccion del contenido
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

//Cuando de click en el boton de bienvenido  se acciona esta función 
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  //permisos necesarios para manipular y obtener información 
  var scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
  //cuando de click en el boton de bienvenido lo redirect al login de Spotify
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state


    }));
});
//entra a la aplicacion
app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

//verifica los estados (respuestas)
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
      
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
//lo bueno, como funciona
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

            //todo lo de la persona
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {'Authorization': 'Bearer ' + access_token },
         
          json: true
        };

        //
        request.get(options, function(error, response, body) {
          // conexion base de datos posgrest
          // var client = new pg.Client(connectionString);
          // client.connect();
          // var text = 'INSERT INTO usuario(nombre,apellido, nick, email) VALUES($1, $2, $3, $4)';
          // var values = [body.id, body.id,body.id,body.email];

          // client.query(text, values, (err, res) => {
          //   if (err) {
          //     console.log(err.stack)
          //   } else {
          //     console.log(res.rows[0])
          //     // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
          //   }
          // })
          // client.end();
           console.log(body);
          
        });

        

  
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
          } else {
            res.redirect('/#' +
              querystring.stringify({
                error: 'invalid_token'
              }));
          }
    });

  }
});

// callback metodo para post 



//base de datos

// app.get('/data', function (req, res) {
//   var client = new pg.Client(connectionString);
//   client.connect();
//   client.query('SELECT * FROM usuario', (err, res) => {
//   console.log(err, res)
//   client.end()
//   })
// });
// callback metodo para post 
// client.query(text, values, (err, res) => {
//   if (err) {
//     console.log(err.stack)
//   } else {
//     console.log(res.rows[0])
//     // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
//   }
//})

/*app.get('/data', function (req, res) {
  console.log('POST /data')
  console.log(req.body)
  // se crea el objeto y se asignan los atributos del body
  let reporte = new Reporte()
  reporte.idLista = "1"
  reporte.idCancion = "1"

  // para guardar en la base de datos 
  reporte.save((err, reporteStored) =>{
    if (err) res.status(500).send({message: 'error'})

    res.status(200).send({reporte : reporteStored})
  })
});*/

//-----------------------------------------------
//ya no uso pero es lo de refresh 
app.get('/refresh_token', function(req, res) {


  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
