define(['buildable','eventemitter2','underscore','_.mixins','wildcards'], function(Buildable, Eventemitter2, _, undef, Wildcards) {

	//////////////////////////////////////////////
	//////// DEFINE INTERNALLY USED METHODS //////
	//////// INSIDE A CLOSURE ////////////////////
	//////////////////////////////////////////////
	// all methods on fsm are called with the context of 
	// the FSM instance object
	// fsm is not accessible from outside! :D
	var fsm = {

		exec: function(methodName, args) {

			// retrieve the method
			var methodExists = function(match) {
					return typeof match.state[methodName] === 'function';
				},
				match = this._states.retrieve(this.state, methodExists);

			if (match) {
				var args = args || [];
				args.unshift(match.token);
				
				return match.state[methodName].apply(this, args);
			} else {
				return false;
			}
		},

		defineState: function(name, state) {
			if (typeof name === 'string' && typeof state === 'object') {
				// just one state
				var _this = this,
					_state = {};

				_.each(state, function(method, methodName) {
					_state[ methodName ] = _this.fsm('_defineMethod', methodName, method);
				});

				// save the state object as a wildcard.
				this._states.card( name, _state);

				return this;

			} else if (typeof name === 'object') {
				var _this = this;

				_.each(name, function(state, name) {
					_this.fsm('defineState', name, state);
				});
			}
		},

		_defineMethod: function(methodName, method) {
			// 1: bind the method to this object
			var method = _.bind(method, this);

			// 2: create a method on the object with this method name,
			// so that when it is called, we intercept it via .exec method
			if (typeof this[ methodName ] === 'undefined') {

				this[ methodName ] = this._stateMethods[ methodName ] = function() {
					var args = _.args(arguments);
					return this.fsm('exec', methodName, args);
				};

			} else if ( !this._stateMethods[ methodName ] ) {
				throw new Error('FSM: the property "'+ methodName +'" is already defined in the object. Please give the method another name.');
			}

			return method;
		},

		set: function(state) {
			if (state === this.state) {
				return false;
			} else {
				// call __leave
				if (typeof this.__leave === 'function') {
					this.__leave();
				}

				this.state = state;

				// call __enter
				if (typeof this.__enter === 'function') {
					this.__enter();
				}
			}
		},

	}


	//////////////////
	/// DEFINE FSM ///
	//////////////////
	var FSM = Object.create(Buildable);
	FSM.extend(Eventemitter2.prototype, {
		init: function(data) {
			var _this = this;

			// bind the exec method to this object
			_.bindAll(this, 'fsm');

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
			this._stateMethods = {};
			this._states = Wildcards.build(_.defaults({
				itemAlias: 'state',
			// 	tokenAlias: 'token',
			}, data.wildcardOptions));

			// define states
			this.fsm('defineState', this.states );

			this.state = data.initial || undefined;
		},

		exec: fsm.exec,

		set: fsm.set,

		fsm: function(fsm_method_name) {
			var args = _.args(arguments, 1);

			return fsm[ fsm_method_name ].apply(this, args);
		}
	});


	return FSM;

});