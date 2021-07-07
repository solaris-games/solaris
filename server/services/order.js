module.exports = class OrderService {
    static ORDER_BUILD_AND_SEND_CARRIER = "ORDER_BUILD_AND_SEND_CARRIER";

    constructor(carrierService, waypointService, starService) {
        this.carrierService = carrierService;
        this.waypointService = waypointService;
        this.starService = starService;
        this.orderHandlers = {
            ORDER_BUILD_AND_SEND_CARRIER: this._handleBuildAndSendCarrier
        }
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
        const orderHandler = this.orderHandlers[orderType];
        if (orderHandler) {
            try {
                return await orderHandler(game, player, data);
            } catch (e) {
                console.error(e);
            }
        }

        return false;
    }

    async _handleBuildAndSendCarrier(game, player, data) {
        if (!data.waypoints || !data.waypoints.length) {
            return false;
        }

        const startingStar = this.starService.getById(data.waypoints[0].source);
        
        if (!Math.floor(startingStar.shipsActual)) {
            return false;
        }
        
        const carriersAtStar = this.carrierService.getCarriersAtStar(game, startingStar._id);
        const carriersOfPlayer = this.carrierService.listCarriersOwnedByPlayer(carriersAtStar, player._id);
        // For simplicity, only handle carriers that have no specialists
        const availableCarriers = carriersOfPlayer.filter(carrier => !carrier.specialistId && (!carrier.waypoints || !carrier.waypoints.length));
        let carrier;
        if (availableCarriers.length != 0) {
            carrier = availableCarriers[0];
        } else {
            carrier = await this.carrierService.createAtStar(startingStar, game.carriers, 1);
        }

        this.waypointService.saveWaypoints(game, player, carrier._id, data.waypoints, Boolean(data.loop))
    }
}