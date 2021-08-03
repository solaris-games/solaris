module.exports = class AIOrderService {
    static CREATE_CARRIER_LOOP = "CREATE_CARRIER_LOOP";

    constructor(carrierService, waypointService, starService, starUpgradeService) {
        this.carrierService = carrierService;
        this.waypointService = waypointService;
        this.starService = starService;
        this.starUpgradeService = starUpgradeService;
        this.orderHandlers = {
            CREATE_CARRIER_LOOP: this._handleCreateCarrierLoop.bind(this)
        }
    }

    async processOrdersForPlayer(game, player) {
        if (!player.scheduledOrders) {
            player.scheduledOrders = [];
        }

        const newOrders = [];

        for (let order of player.scheduledOrders) {
            let success = false;
            try {
                success = await this._performOrder(game, player, order.orderType, order.data);
            } finally {
                if (!success) {
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

    async _handleCreateCarrierLoop(game, player, data) {
        if (!data || !data.from || !data.to) {
            return false;
        }

        const expenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];
        const carrierCost = this.starUpgradeService.calculateCarrierCost(game, expenseConfig);

        return true;

        /*


        const startingStar = this.starService.getById(game, data.waypoints[0].source);
        
        const carriersAtStar = this.carrierService.getCarriersAtStar(game, startingStar._id);
        const carriersOfPlayer = this.carrierService.listCarriersOwnedByPlayer(carriersAtStar, player._id);
        // For simplicity, only handle carriers that have no specialists
        const availableCarriers = carriersOfPlayer.filter(carrier => !carrier.specialistId && (!carrier.waypoints || !carrier.waypoints.length));
        let carrier;
        if (availableCarriers.length != 0) {
            carrier = availableCarriers[0];
        } else {
            if (!Math.floor(startingStar.shipsActual) || player.credits < carrierCost) {
                //Returning false means we retry next time
                return false;
            }
            
            carrier = await this.starUpgradeService.buildCarrier(game, player, startingStar._id, startingStar.ships).carrier;
        }

        if (carrier) {
            await this.waypointService.saveWaypointsForCarrier(game, player, carrier, data.waypoints, Boolean(data.loop))
            return true;
        }*/
    }
}