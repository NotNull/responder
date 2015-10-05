var Listener = require('./listener');
var _ = require('lodash');

function Responder(){
	var r = this;
	this.$listeners = [];

	process.on('message', function(message){
		var event = message.event;
		var data = message.data;
		
		r.emit(event, data);
	});
}

Responder.prototype.on = function(ev, fn){
	var child = null;
	
	if(_.isObject(ev)){
		child = ev.child;
		ev = ev.event;
	}
	
	this.$listeners.push(new Listener(ev, fn, child));
};

Responder.prototype.emit = function(ev){
	var child = null;
	var args = _.rest(arguments);
	var cb = args.pop() || _.noop;//last should always be callback

	if(_.isObject(ev)){
		child = ev.child;
		ev = ev.event;
	}
	
	var _listeners = [];
	
	_.forEach(this.$listeners, function(listener){
		var params = listener.match(ev);
		
		if(params){
			_listeners.push({
				listener: listener,
				params: params
			});
		}
	});
	
	var first = true;
	
	var _next = function(){
		var listener = _listeners.shift();
		var args = Array.prototype.slice.call(arguments) || [];
		
		if(!listener){
			if(_.isFunction(cb)){
				return cb.apply({}, args);
			}
			
			return false;
		}
		
		if(first === true || args.length === 0){
			args = _.values(listener.params);
		}
		
		args.push(_next);
		
		if(listener.listener.$child === child && child !== null){
			return _next();
		}
		
		listener.listener.$fn.apply({
			event: ev
		}, args);
	};
	
	_next();
	
	if(process.send){	
		process.send({
			event: ev,
			data: args
		});	
	}
};

module.exports = Responder;