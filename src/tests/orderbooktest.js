import { assert } from 'chai';
import OrderMatcher from '../lib/ordermatcher';

describe("Test OrderMatcher", function () {
    var matcher = new OrderMatcher();
    var order1 = matcher.submitOrder({ pair: "BTC/LTC", user_id: "userbala", quantity: "100", price: "850" }); //Buy Order
    var order2 = matcher.submitOrder({ pair: "BTC/LTC", user_id: "userbala", quantity: "30", price: "175" }); //Buy Order
    var order3 = matcher.submitOrder({ pair: "BTC/LTC", user_id: "balauser", quantity: "-30", price: "2000" });  //Sell Order
    it('OrderMatcher created', function () {
        assert.isOk(matcher, "OrderMatcher created");
    })
    it('Test Order IDs returning', function () {
        assert.isOk(order1.id, "Buy Order id returned");
        assert.isOk(order2.id, "Buy Order id returned");
        assert.isOk(order3.id, "Sell Order id returned");
    })
   
    it('Unique Order IDs', function () {
        assert.notEqual(order1.id, order2.id, order3.id, "Order ids must be unique");
    })

    it('Order Execution Status', function () {
        assert.equal(order1.status, "Pending");
        assert.equal(order2.status, "Pending");
        assert.equal(order3.status, "Complete");
    })
   
    it('Zero Quantity Order Submission', function () {
        assert.throws(function () { matcher.submitOrder({ pair: "BTC/LTC", quantity: 0, price: "150" }) }, Error);
    })
});