var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');

function Listener(ev, fn, child){
	this.$keys = [];
	this.$re = pathToRegexp(ev, this.$keys);
	this.$fn = fn;
	this.$event = ev;
	this.$child = child;
}

Listener.prototype.match = function(ev){
	var matches = this.$re.exec(ev);
	var params = {};
	
	if(!matches){
		return false;
	}
	
	matches.shift();//Take out first one.

	for(var x = 0; x < matches.length; x++){
		params[this.$keys[x].name] = matches[x];
	}
	
	return params;
};

module.exports = Listener;