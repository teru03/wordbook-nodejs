var mongoose = require('mongoose');
var util = require('util');
var events = require('events');

var db = null;

var DbCtrl = function() {
    if( !db ){
        db = mongoose.connect('mongodb://0.0.0.0:27017/searchedword');
    
        //検索されたワードのスキーマを宣言。
        var WordSchema = mongoose.Schema(
            {
                word:{type:String},
                count:{type:Number},
                update:{type:Date}
            }
        );
        //スキーマからモデルを生成。
        db.model('word',WordSchema);
    }
    
};

util.inherits(DbCtrl, events.EventEmitter);

DbCtrl.prototype.find = function(n) {
	var self = this;
    var Word = db.model('word');
    Word.find().sort({update:-1}).limit({limit:n}).exec( function(err, docs) {
        if(err){
            console.log(err);
            self.emit('err', err);
        }
        else{
//            console.log(docs);
            self.emit('find', docs);
        }
    });    
}

// Gets the list of supported languages for each feature supported by Microsoft Translator public APIs
DbCtrl.prototype.insert = function(msg) {

	var self = this;
	
    var Word = db.model('word');
    Word.find({word:msg} , function(err, docs) {
        if( docs.length >= 1){
            docs[0].count++;
            docs[0].update = new Date();
            docs[0].save(function(err) {
                if (err) { console.log(err); }
                self.emit('err', msg);
            });
        }
        else{
            var word = new Word;
            word.word = msg;
            word.count = 1;
            word.update = new Date();
            word.save(function(err) {
                if (err) { console.log(err); }
                self.emit('err', msg);
            });

        }
        db.model('word').find().sort({update:-1}).limit({limit:5}).exec(function(err,searcheddocs){
            self.emit('insert', searcheddocs);
        });
    });    

}

DbCtrl.prototype.disconnect = function() {
    mongoose.disconnect();
}

module.exports = DbCtrl;

