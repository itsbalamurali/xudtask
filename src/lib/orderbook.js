export default class OrderBook {
	constructor() {
		this.levels = [];
	};

	map(func) {
		return this.levels.map(func);
	};

	addOrder(order) {
		if (order.quantity <= 0)
			return;
		var levelIndex = 0;
		var level = this.levels[0];
		var comp = order.isBuy ?
			function (price) { return order.price < price; }
			:
			function (price) { return order.price > price; }

		while (level && comp(level.price)) {
			levelIndex = levelIndex + 1;
			level = this.levels[levelIndex];
		}

		if (!level || level.price !== order.price) {
			level = [];
			level.price = order.price;
			this.levels.splice(levelIndex, 0, level);
		}
		level.push(order);
	};

	removeOrder(order) {
		for (var l = 0; l < this.levels.length; l++) {
			var level = this.levels[l];
			if (level.price === order.price) {
				for (var i = 0; i < level.length; i++) {
					if (level[i].id === order.id) {
						level.splice(i, 1);
						if (level.length === 0) {
							this.levels.splice(i, 1);
						}
						return true;
					}
				}
			}
		}
		return false;
	};

	findMatches(order) {
		var comp = order.isBuy ?
			function (price) { return order.price >= price; }
			:
			function (price) { return order.price <= price; }
		var remainingQuantity = order.quantity;
		var matches = [];
		for (var i = 0; i < this.levels.length; i++) {
			var level = this.levels[i];
			if (!comp(level.price)) {
				break;
			}
			for (var j = 0; j < level.length && remainingQuantity > 0; j++) {
				var restingOrder = level[j];
				matches.push(restingOrder);
				remainingQuantity = remainingQuantity - restingOrder.quantity;
			}
		}
		return matches;
	};
}