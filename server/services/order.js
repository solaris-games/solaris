module.exports = class OrderService {
    constructor(carrierService, waypointService) {
        this.carrierService = carrierService;
        this.waypointService = waypointService;
    }

    async processOrdersForPlayer(game, player) {
        if (!player.scheduledOrders) {
            player.scheduledOrders = [];
        }

        const newOrders = [];

        for (let order of player.scheduledOrders) {
            const success = await this._performOrder(game, player, order.orderType, order.data);
            const retryPolicy = order.retryPolicy || "delete";
            if (!success) {
                if (retryPolicy === "retry") {
                    newOrders.push(order);
                }
            }
        }

        player.scheduledOrders = newOrders;
    }

    async _performOrder(game, player, orderType, data) {
        
    }
}