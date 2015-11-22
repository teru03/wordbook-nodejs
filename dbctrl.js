var mongoose = require('mongoose');
var util = require('util');
var events = require('events');

var db;

var DbCtrl = function() {
    db = mongoose.connect('mongodb://localhost/searchedword');

    //検索されたワードのスキーマを宣言。
    var WordSchema = new mongoose.Schema(
        {
            word:{type:String},
            count:{type:Number}
        }
    );
    //スキーマからモデルを生成。
    db.model('word',WordSchema);
    
};

util.inherits(DbCtrl, events.EventEmitter);

DbCtrl.prototype.find = function() {
	var self = this;
    var Word = db.model('word');
    Word.find({} , function(err, docs) {
        if(err){
            console.log(err);
            self.emit('err', err);
        }
        else{
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
            docs[0].doc.count++;
            self.emit('insert', docs[0].doc);
        }
        else{
            var word = new Word;
            word.word = msg;
            word.count = 1;
            word.save(function(err) {
                if (err) { console.log(err); }
                self.emit('err', msg);
            });
            self.emit('insert', word);
            
        }
    });    

}

module.exports = DbCtrl;

