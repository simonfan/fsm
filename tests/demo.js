define(['fsm'], function(FSM) {

	window.Dog = Object.create(FSM);

	Dog.extend({
		init: function(data) {
			this.name = data.name;
		},

		states: {
			barking: {
				pet: function() {
					this.state = 'wagging_tail';
				},
			},

			wagging_tail: {
				pet: function() {
					this.state = 'sitting';
				},

				wait: function() {
					this.state = 'barking';
				}
			},

			sitting: {

			},

			'*': {
				pet: function() {
					console.log(this.name + ' is confused...');
				},

				squirrel: function() {
					this.state = 'barking';
				},
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