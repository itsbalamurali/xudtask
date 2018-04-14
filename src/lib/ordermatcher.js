import OrderBook from './orderbook';
export default class OrderMatcher {
	constructor() {
		this.orderId = 0
		this.bids = new OrderBook();
		this.offers = new OrderBook();
		this.orders = {};
	}

	getNewId() {
		var orderId = ++this.orderId;
		return orderId;
	};

	adjustQuantity(order, newQuantity) {
		order.quantity = Math.max(0, newQuantity);
		if (order.quantity === 0) {
			order.status = "Complete";
		}
	};

	submitOrder(order) {
		if (order.quantity === 0) {
			throw new Error("Order must have non-zero quantity");
		}

		var isBuy = order.quantity > 0;
		var book = isBuy ? this.bids : this.offers;
		var otherBook = isBuy ? this.offers : this.bids;
		var oid = this.getNewId();
		var matching_orders = []
		var aggressiveOrder = {
			id: oid,
			price: order.price,
			quantity: Math.abs(order.quantity),
			status: "Pending",
			user_id: order.user_id,
			isBuy: isBuy
		};

		var matches = otherBook.findMatches(aggressiveOrder);

		this.orders[aggressiveOrder.id] = aggressiveOrder;

		for (var i = 0; i < matches.length; i++) {
			var restingOrder = matches[i];
			var matchQuantity = Math.min(aggressiveOrder.quantity, restingOrder.quantity);
			this.adjustQuantity(restingOrder, restingOrder.quantity - matchQuantity);
			this.adjustQuantity(aggressiveOrder, aggressiveOrder.quantity - matchQuantity);
			if (restingOrder.quantity === 0) {
				otherBook.removeOrder(restingOrder);
			}
			matching_orders.push({ id: matches[i].id, user_id: matches[i].user_id });
		}

		if (aggressiveOrder.quantity > 0) {
			book.addOrder(aggressiveOrder);
		}
		if (matching_orders.length > 0) {
			aggressiveOrder.matching_orders = matching_orders;
		}

		return aggressiveOrder;
	};

	getOrderStats() {
		var levelReduce = function (order1, order2) {
			return {
				quantity: order1.quantity + order2.quantity,
				price: order1.price
			}
		};
		var levelConverter = function (level) {
			if (!level) return [];
			if (level.length == 1) {
				return { quantity: level[0].quantity, price: level[0].price };
			}
			return level.reduce(levelReduce)
		};
		var bids = this.bids.map(levelConverter);
		var offers = this.offers.map(levelConverter);
		return {
			bids: bids,
			offers: offers,
			orders: this.orders
		};
	};
}