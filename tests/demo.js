define(['fsm'], function(FSM) {

	window.Dog = Object.create(FSM);

	Dog.extend({
		init: function(data) {
			this.name = data.name;
		},

		states: {
			barking: {
				pet: function() {
					this.state = 'wagging_tail:fast';

					return this;
				},
			},

			'wagging_tail:*': {
				wait: function(speed) {
					console.log('I was wagging my tail at ' + speed + ' speed')
					this.state = 'barking';

					return this;
				}
			},

			'wagging_tail:fast': {
				pet: function() {
					this.state = 'wagging_tail:slow';
					console.log(this.state);
				},
			},

			'wagging_tail:slow': {
				pet: function() {
					this.state = 'sitting';
					console.log(this.state);
				}
			},

			sitting: {

			},

			'*': {
				pet: function(token, arg1) {
					console.log(this.name + ' is confused... ' + token);
					console.log('arg1: ', arg1)
				},

				squirrel: function(token) {
					this.state = 'barking';
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