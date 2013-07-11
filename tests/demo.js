define(['fsm'], function(FSM) {

	window.Dog = Object.create(FSM);

	Dog.extend({
		init: function(data) {
			this.name = data.name;
		},

		states: {
			barking: {
				pet: function() {
					this.set('wagging_tail:fast');

					return this;
				},

				__enter:function() {
					alert('start barking! ... au au au!')
				},

				__leave:function() {
					alert('stop barking ...!au au au...')
				},
			},

			'wagging_tail:*': {
				wait: function(speed) {
					console.log('I was wagging my tail at ' + speed + ' speed')
					this.set('barking');

					return this;
				},

				__enter: function() {
					console.log('I started wagging my tail')
				},

				__leave: function() {
					console.log('I stopped wagging my tail')
				}
			},

			'wagging_tail:fast': {
				pet: function() {
					this.set('wagging_tail:slow');
				},
			},

			'wagging_tail:slow': {
				pet: function() {
					this.set('sitting');
				}
			},

			sitting: {
				'*': function(state, arg1) {
					console.log('I am sitting... do not know what to do with ' + arg1);
				}
			},

			'*': {
				pet: function(token, arg1) {
					console.log(this.name + ' is confused... ' + token);
					console.log('arg1: ', arg1)
				},

				squirrel: function(token) {
					this.set('barking');
				},

				skavurska: function(token) {
					console.log('skavurska')
				}
			},
		}
	});

	window.dog = Dog.build({
		name: 'Bakunin',
		initial: 'barking',
	});




	dog.on('changestate', function(state, dog) {
		console.log('Dog has changed its state to ' + state);
	})




	// elstate
	window.ElState = Object.create(FSM);
	ElState.extend({
		init: function(options) {
			this.$el = options.$el || options.el;
		},

		states: {
			
		}
	})

});