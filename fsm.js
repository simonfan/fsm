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
			// try the exact method name
			var match = this.fsm('_retrieve', methodName),
				special = methodName.match(/^__/);

			// only try to use the general method IF:
			// 1: there is no exact method AND
			// 2: the method is not a special method (identified by the '__' prefix)
			if (!match && !special) {
				// then try the general method name
				methodName = '*';
				match = this.fsm('_retrieve', methodName);
			}

			if (match) {
				return this.fsm('_execMatch', match, methodName, args);
			} else {
				return false;
			}
		},

		// run the match
		_execMatch: function(match, methodName, args) {
			var args = args || [],
				token = match.token;

			// transform args into array
			args = _.isArray(args) ? args : [args];

			if (_.isArray(token)) {
				// remove false values from token
				token = _.compact(token);
				args = token.concat(args);

			} else if (token != '') {
				args.unshift(token);
			}
			
			return match.state[methodName].apply(this, args);
		},

		// retrieve exact method for any of the states state[methodName] or *[methodName]
		_retrieve: function(methodName) {
			// retrieve the method
			var exactMethodExists = function(match) {
					return typeof match.state[methodName] === 'function';
				},
				match = this._states.retrieve(this.state, exactMethodExists);

			return match;
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

				this[ methodName ] = this._stateMethods[ methodName ] = this.fsm('_prepareMethod', methodName);

			} else if ( !this._stateMethods[ methodName ] ) {
				throw new Error('FSM: the property "'+ methodName +'" is already defined in the object. Please give the method another name.');
			}

			return method;
		},

		// _defineMethod helper, it wraps the exec method in a function
		_prepareMethod: function(methodName) {
			return function() {
				var args = _.args(arguments);
				return this.fsm('exec', methodName, args);
			}
		},

		set: function(state) {
			if (state === this.state) {
				return false;
			} else {
				var args = _.args(arguments, 1);
				
				// call __leave
				this.fsm('exec', '__leave', args);

				this.state = state;

				// call __enter
				this.fsm('exec', '__enter', args);
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
					tokenDelimiter: '-',
					itemAlias: 'item',
					tokenAlias: 'tokens',
					context: undefined
				}
			*/
			this._stateMethods = {};
			this._states = Wildcards.build(_.defaults({
				itemAlias: 'state',
			 	tokenAlias: 'token',
			//	tokenDelimiter: '-',
			}, data.wildcardOptions));

			// define states
			this.fsm('defineState', this.states );

			///////////////////////////////////
			// define initial state! //////////
			///////////////////////////////////
			var args = _.args(arguments);
			this.state = this.initial.apply(this, args);
		},

		///////////////////////////////////////////
		//// overwrite this method             ////
		//// in order to set the initial state ////
		///////////////////////////////////////////
		initial: function(data) {
			return data.initial;
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