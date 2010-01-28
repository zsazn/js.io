jsio('from base import *');
jsio('import logging');

var logger = logging.getLogger('uri');

var attrs = [ 
	"source",
	"protocol",
	"authority",
	"userInfo",
	"user",
	"password",
	"host",
	"port",
	"relative",
	"path",
	"directory",
	"file",
	"query",
	"anchor"
];

exports.Uri = Class(function(supr) {
	this.init = function(url, isStrict) {
		var uriData = exports.parse(url, isStrict)
		for (attr in uriData) {
			this['_' + attr] = uriData[attr];
		};
	};
  
	for (var i = 0, attr; attr = attrs[i]; ++i) {
		(function(attr) {
			var fNameSuffix = attr.charAt(0).toUpperCase() + attr.slice(1);
			this['get' + fNameSuffix] = function() {
				return this['_' + attr];
			};
			this['set' + fNameSuffix] = function(val) {
				this['_' + attr] = val;
			};
		}).call(this, attr);
	};

	this.toString = this.render = function() {
		// XXX: implement in terms of the keys. Reasonable fallbacks?
		return this._source;
	};
});

exports.buildQuery = function(kvp) {
	var pairs = [];
	for (key in kvp) {
		pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(kvp[key]));
	}
	return pairs.join('&');
}

// Regexs are based on parseUri 1.2.2
// Original: (c) Steven Levithan <stevenlevithan.com>
// Original: MIT License

var strictRegex = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
var looseRegex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var queryStringRegex = /(?:^|&)([^&=]*)=?([^&]*)/g;

exports.parse = function(str, isStrict) {
	var regex = isStrict ? strictRegex : looseRegex;
	var result = {};
	var match = regex.exec(str);
	for (var i = 0, attr; attr = attrs[i]; ++i) {
		result[attr] = match[i] || "";
	}
	
	var qs = result['queryKey'] = {};
	result['query'].replace(queryStringRegex, function(check, key, val) {
		if (check) {
			qs[key] = val;
		}
	});
	
	return result;
}

exports.isSameDomain = function(urlA, urlB) {
	var a = exports.parse(urlA);
	var b = exports.parse(urlB);
	return ((a.port == b.port ) && (a.host == b.host) && (a.protocol == b.protocol));
};
