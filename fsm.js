define(['buildable','eventemitter2','underscore','_.mixins','wildcards'], function(Buildable, Eventemitter2, _, undef, Wildcards) {

	//////////////////////////////////////////////
	//////// DEFINE INTERNALLY USED METHODS //////
	//////// INSIDE A CLOSURE ////////////////////
	//////////////////////////////////////////////
	// all methods on fsm are called with the context of 
	// the FSM instance object
	// fsm is not accessible from outside! :D
	var fsm = {};

	fsm.exec = function(methodName, args) {

		// retrieve the method
		var methodExists = function(match) {
				return typeof match.state[methodName] === 'function';
			},
			match = this.wildcards.retrieve(this.state, methodExists);

		if (match) {
			var args = args || [];
			args.unshift(match.token);

			console.log(args);
			
			return match.state[methodName].apply(this, args);
		} else {
			return false;
		}
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

		// save the state object as a wildcard.
		this.wildcards.card( stateName, _state);

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


			// build the wildcard machine
			/*
				options: {
					delimiter: ':',
					token: '*',
					tokenRegExp: /\*.* /,
					itemAlias: 'item',
					tokenAlias: 'tokens',
					context: undefined
				}
			*/
			this.wildcards = Wildcards.build(_.defaults({
				itemAlias: 'state',
			// 	tokenAlias: 'token',
			}, data.wildcardOptions));

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