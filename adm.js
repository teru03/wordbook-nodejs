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

var Adm = function(client_id, client_secret) {
    this.requestBody = 'grant_type=client_credentials&client_id=' + encodeURIComponent(client_id) + '&client_secret=' +
					   encodeURIComponent(client_secret) + '&scope=http://api.microsofttranslator.com/';

    this.currentToken = null;
    this.currentTokenExpirationTime = null;

	events.EventEmitter.call(this);
};

util.inherits(Adm, events.EventEmitter);

Adm.prototype.getToken = function() {

	// Check if the token is in-memory cache and not expired
	if(this.currentToken && this.currentTokenExpirationTime > Date.now()) {
		this.emit('token', this.currentToken);
		return;
	}
    
	var self = this;

	var options = {
		hostname: 'datamarket.accesscontrol.windows.net',
		port: 443,
		path: '/v2/OAuth2-13',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': this.requestBody.length
		}
	};

	var req = http.request(options, function(response) {
	    
		response.on('data', function(data) {
			var jsonResponse = JSON.parse(data);
			if(jsonResponse.hasOwnProperty('error')) {
				self.emit('error', jsonResponse.error);
			} else {
				if(jsonResponse.expires_in > 30) {
					self.currentTokenExpirationTime = Date.now() + (jsonResponse.expires_in - 30 ) * 1000;			
				} else {
					self.currentTokenExpirationTime = Date.now() + jsonResponse.expires_in * 1000;
				}

				self.currentToken = jsonResponse.access_token;
				self.emit('token', self.currentToken);
			}
		});
	});

	req.on('error', function(e) {
		self.emit('error', e.message);
	});

	req.write(this.requestBody);
	req.end();
};

module.exports = Adm;