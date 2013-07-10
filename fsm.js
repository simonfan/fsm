define(['buildable','eventemitter2','underscore','_.mixins'], function(Buildable, Eventemitter2, _, undef) {

	//////////////////////////////////////////////
	//////// DEFINE INTERNALLY USED METHODS //////
	//////// INSIDE A CLOSURE ////////////////////
	//////////////////////////////////////////////
	// all methods on fsm are called with the context of 
	// the FSM instance object
	// fsm is not accessible from outside! :D
	var fsm = {};

	fsm.exec = function(methodName, args) {
		var method = this.fsm('findMethod', this.state, methodName),
			args = args || [];

		if (typeof method === 'function') {
			return method.apply(this, args) || this;
		} else {
			return false;
		}
	}

	fsm.findMethod = function(stateName, methodName) {
		var method,
			state = this._states[ stateName ];

		if (state) {
			method = state[ methodName ];
			method = method ? method : this._states['*'] ? this._states['*'][ methodName ] : undefined;
		} else {
			method = this._states['*'] ? this._states['*'][ methodName ] : undefined;
		}

		return method;
	}

	fsm.defineState = function(name, state) {
		if (typeof name === 'string' && typeof state === 'object') {
			// just one state
			return this.fsm('_defineState', name, state);

		} else if (typeof name === 'object') {
			var _this = this;

			_.each(name, function(state, name) {
				_this.fsm('defineState', name, state);
			});

		}
	}


	fsm._defineState = function(stateName, state) {
		var _this = this,
			_state = {};

		_.each(state, function(method, name) {

			// 1: bind the method to _this object
			_state[ name ] = _.bind(method, _this);

			// 2: create a method on the object with this method name,
			// so that when it is called, we intercept it via .exec method
			if (typeof _this[ name ] === 'undefined') {

				_this[ name ] = _this._stateMethods[ name ] = function() {
					var args = _.args(arguments);
					return _this.fsm('exec', name, args);
				};

			} else if ( !_this._stateMethods[ name ] ) {
				throw new Error('FSM: the property "'+ name +'" is already defined in the object. Please give the method another name.');
			}
		});

		this._states[ stateName ] = _state;

		return this;
	}


	fsm.set = function(state) {
		this.state = state;
	}


	//////////////////
	/// DEFINE FSM ///
	//////////////////
	var FSM = Object.create(Buildable);
	FSM.extend(Eventemitter2.prototype, {
		init: function(data) {
			var _this = this,
				_wildcards = [],
				_methodNames = [];

			// bind the exec method to this object
			_.bindAll(this, 'fsm');

			// states hash
			this._states = {};
			// state-methods
			this._stateMethods = {};

			// define states
			this.fsm('defineState', this.states );

			this.state = data.initial || undefined;
		},

		exec: fsm.exec,

		fsm: function(fsm_method_name) {
			var args = _.args(arguments);
			args.shift();

			return fsm[ fsm_method_name ].apply(this, args);
		}
	});


	return FSM;

});