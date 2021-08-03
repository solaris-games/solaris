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

        const carriersAtFrom = this.getAvailableCarriersAtStar(game, player, data.from);
        const carriersAtTo = this.getAvailableCarriersAtStar(game, player, data.to);

        let carrier;
        let start;
        let startAction;
        let end;
        let endAction;

        if (carriersAtFrom && carriersAtFrom.length != 0) {
            carrier = carriersAtFrom[0];
            start = data.from;
            end = data.to;
            startAction = "collectAll";
            endAction = "dropAll";
        } else if (carriersAtTo && carriersAtTo.length != 0) {
            carrier = carriersAtTo[0];
            start = data.to;
            end = data.from;
            startAction = "dropAll";
            endAction = "collectAll";
        } else if (player.credits >= carrierCost) {
            const fromStar = this.starService.getById(game, data.from);
            const toStar = this.starService.getById(game, data.to);
            if (Math.floor(fromStar.shipsActual)) {
                carrier = await this.starUpgradeService.buildCarrier(game, player, fromStar._id, fromStar.ships).carrier;
                start = data.from;
                end = data.to;
                startAction = "collectAll";
                endAction = "dropAll";
            } else if (Math.floor(toStar.shipsActual)) {
                carrier = await this.starUpgradeService.buildCarrier(game, player, toStar._id, toStar.ships).carrier;
                start = data.to;
                end = data.from;
                startAction = "dropAll";
                endAction = "collectAll";
            } else {
                // Neither star has a ship
                return false;
            }
        } else {
            // No carriers exist and we can't afford one
            return false;
        }

        if (!carrier) {
            return false;
        }

        const waypoints = [
            {
                source: start,
                destination: end,
                action: endAction,
                actionShips: 0,
                delayTicks: 0
            },
            {
                source: end,
                destination: start,
                action: startAction,
                actionShips: 0,
                delayTicks: 0
            }
        ];

        return Boolean(await this.waypointService.saveWaypointsForCarrier(game, player, carrier, waypoints, true));
    }

    getAvailableCarriersAtStar (game, player, starId) {
        const carriersAtStar = this.carrierService.getCarriersAtStar(game, starId);
        const carriersOfPlayer = this.carrierService.listCarriersOwnedByPlayer(carriersAtStar, player._id);
        // For simplicity, only handle carriers that have no specialists
        return carriersOfPlayer.filter(carrier => !carrier.specialistId && (!carrier.waypoints || !carrier.waypoints.length));
    }
}