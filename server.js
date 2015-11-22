//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var https = require('https');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var DbCtrl = require('./dbctrl.js');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var dbctrl = new DbCtrl;

router.use(express.static(path.resolve(__dirname, 'client')));

io.on('connection', function (socket) {

  socket.on('wordsearch', function (msg) {
    var MicrosoftTranslator = require('./microsofttranslator.js');
//    console.log("MicrosoftTranslator = ", MicrosoftTranslator);
//    console.log("input text = ", msg);
    var data = {'word':msg};
    socket.emit('wordsearchresult', data );
    
    var transctrl = new MicrosoftTranslator.MicrosoftTranslator("your id","your client_secret");
    transctrl.adm.getToken();
    
    transctrl.adm.on( 'token', function(token){
//      console.log("token = ", token);
      var tokendata = {'token': token };
      socket.emit('gettoken', tokendata );

    });
    
    transctrl.adm.on('error', function(e){
      console.log("error = ", e);
    });

  });

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
