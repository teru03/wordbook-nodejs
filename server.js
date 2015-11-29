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

router.use(express.static(path.resolve(__dirname, 'client')));

io.on('connection', function (socket) {
  
  //searchedworddbへのコネクト
  var dbctrl = new DbCtrl();
  

  socket.on('connect',function(){
    //最新の5件を検索
    dbctrl.find(5);
    //0.検索結果
    dbctrl.on('find',function(words){
      console.log('first find',words);
      //0-1.クライアントに検索ワード列を
//      socket.broadcast.emit('transwordlist',words);  
      socket.emit('transwordlist',words);  
    })
    
  })  

  //2.翻訳処理実行
  socket.on('wordtrans', function (msg) {
    //2-1.トークンの取得
    var MicrosoftTranslator = require('./microsofttranslator.js');
//    console.log("MicrosoftTranslator = ", MicrosoftTranslator);
//    console.log("input text = ", msg);
    var transctrl = new MicrosoftTranslator.MicrosoftTranslator("your id","your secret");
    transctrl.adm.getToken();

    //2-2.トークン取得成功
    transctrl.adm.on( 'token', function(token){
//      console.log("token = ", token);
      var tokendata = {'token': token };
      //トークンをクライアントへ
      socket.emit('gettoken', tokendata );

    });

    //エラーハンドラ  
    transctrl.adm.on('error', function(e){
      console.log("error = ", e);
    });

  });

  //4.結果をmongodbへ保存
  socket.on('result',function(word){
    console.log("result = ", word);
    dbctrl.insert(word);
    
    //4-1.検索結果
    dbctrl.on('insert',function(words){
      //4-1-1.クライアントに検索ワード列を
//      socket.broadcast.emit('transwordlist',words);  
      socket.emit('transwordlist',words);  
    })
  });

  //切断時の処理  
  socket.on("disconnect", function () {
    dbctrl.disconnect();
  });  

});



server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
