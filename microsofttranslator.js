//**********************************************************************************//
//    Copyright (c) Microsoft. All rights reserved.
//    
//    MIT License
//    
//    You may obtain a copy of the License at
//    http://opensource.org/licenses/MIT
//    
//    THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, 
//    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
//    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
//    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
//    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
//    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE 
//    OR OTHER DEALINGS IN THE SOFTWARE.
//
//**********************************************************************************//

var http = require('https');
var util = require('util');
var events = require('events');
var Adm = require('./adm.js');

// Features supported by Microsoft Translator public APIs
var LanguageFeatures = {
	Text: 1,
	Speech: 2,
	TextToSpeech: 4
};

// Default constructor with ADM credentials
var MicrosoftTranslator = function(client_id, client_secret) {
	this.adm = new Adm(client_id, client_secret);
	events.EventEmitter.call(this);
};

util.inherits(MicrosoftTranslator, events.EventEmitter);

// Gets the list of supported languages for each feature supported by Microsoft Translator public APIs
MicrosoftTranslator.prototype.getLanguages = function(features) {
	
	var scope = '';
	if(features & LanguageFeatures.Text) scope = 'text,';
	if(features & LanguageFeatures.Speech) scope += 'speech,';
	if(features & LanguageFeatures.TextToSpeech) scope += 'tts';
	if(scope.length == 0) {
		self.emit('error', "Invalid features");
		return;
	}
	
	var self = this;
	var options = {
		hostname: 'dev.microsofttranslator.com',
		port: 443,
		path: '/api/languages?scope=' + scope.substring(0, scope.length - 1)
	};
	
	var req = http.get(options, function(response) {
	    var body = '';
		
		response.on('data', function(data) {
			body += data;
		});
		
		response.on('end', function() {
			var jsonResponse = JSON.parse(body);
			if(jsonResponse.hasOwnProperty('error')) {
				self.emit('error', jsonResponse.error);
			} else {
				self.emit('languages', jsonResponse);
			}
		});
	});

	req.on('error', function(e) {
		self.emit('error', e.message);
	});

	req.end();
};

module.exports.MicrosoftTranslator = MicrosoftTranslator;
module.exports.LanguageFeatures = LanguageFeatures;