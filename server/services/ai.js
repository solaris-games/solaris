const FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE = 20;
const FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE = 30;
const LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE = 100;

const Delaunator = require('delaunator');
const { intersectionOfSets, maxBy } = require('../utils.js')

module.exports = class AIService {

    constructor(starUpgradeService, carrierService, starService, distanceService) {
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.starService = starService;
        this.distanceService;
    }

    async play(game, player) {
        if (!player.defeated) {
            throw new Error('The player is not under AI control.');
        }

        // Considering the growing complexity of AI logic, 
        // it's better to catch any possible errors and have the game continue with disfunctional AI than to break the game tick logic.
        try {
            if (!player.ai) {
                player.ai = true;
                await this._setupAi(game, player);
            }
    
            let isFirstTick = game.state.tick % game.settings.galaxy.productionTicks === 1;
            let isLastTick = game.state.tick % game.settings.galaxy.productionTicks === game.settings.galaxy.productionTicks - 1;
    
            if (isFirstTick) {
                await this._playFirstTick(game, player);
            } else if (isLastTick) {
                await this._playLastTick(game, player);
            }
        } catch (e) {
            console.error(e);
        }

        // TODO: Not sure if this is an issue but there was an occassion during debugging
        // where the player credits amount was less than 0, I assume its the AI spending too much somehow
        // so adding this here just in case but need to investigate.
        player.credits = Math.max(0, player.credits);
    }

    async _setupAi(game, player) {
        this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);
        player.researchingNext = 'random'; // Set up the AI for random research.
        
        // Make sure all stars are marked as not ignored - This is so the AI can bulk upgrade them.
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        for (let star of playerStars) {
            star.ignoreBulkUpgrade = false;
        }

        // This way, vertex indices = indices into coord array = indices into playerStars array
        const coords = playerStars.map(star => [ star.location.x, star.location.y ]);
        const delaunay = Delaunator.from(coords);
        // Map VertexIndex -> TriangleIndex set
        const vertexIndexToTriangleIndices = new Map();
        // Map TriangleIndex -> VertexIndex set
        const triangleIndexToVertexIndices = new Map();
        
        for (let i = 0; i < delaunay.triangles.length; i++) {
            const triangleIndex = Math.floor(i / 3);
            const vertexIndex = delaunay.triangles[i];
            const triangleIndices = vertexIndexToTriangleIndices.get(vertexIndex) || new Set();
            triangleIndices.add(triangleIndex);
            vertexIndexToTriangleIndices.set(vertexIndex, triangleIndices);
            const vertexIndices = triangleIndexToVertexIndices.get(triangleIndex) || new Set();
            vertexIndices.add(vertexIndex);
            triangleIndexToVertexIndices.set(triangleIndex, vertexIndices);
        }

        // Map VertexIndex -> VertexIndex set
        // Represents the vertex/triangle graph
        const vertexIndexToConnectedVertexIndices = new Map();
        for (let [ vertexIndex, triangleIndices ] of vertexIndexToTriangleIndices) {
            const otherVertices = new Set();
            for (let triangleIndex of triangleIndices) {
                const verticesForTriangle = triangleIndexToVertexIndices.get(triangleIndex);
                for (let vidx of verticesForTriangle) {
                    otherVertices.add(vidx);
                }
            }
            vertexIndexToConnectedVertexIndices.set(vertexIndex, otherVertices);
        }

        // borderTriangles: All triangles that have less than 3 triangles they share two vertices with
        const borderTriangles = new Set();
        // borderTrianglesToTrianglesWithSharedVertices: border triangles mapped to ALL triangles they share vertices with, regardless of the number.
        const borderTrianglesToTrianglesWithSharedVertices = new Map();
        for (let [ triangleIndex, vertexIndices ] of triangleIndexToVertexIndices) {
            // All triangles the triangleIndex shares vertices with
            const triangleCandidates = new Set();
            for (let vertexIndex of vertexIndices) {
                const trianglesForVertex = vertexIndexToTriangleIndices.get(vertexIndex);
                for (let trFV of trianglesForVertex) {
                    triangleCandidates.add(trFV);
                }
            }
            
            const trianglesWithTwoSharedVertices = Array.from(triangleCandidates).map(triangleCandidate => {
                const verticesOfCandidate = triangleIndexToVertexIndices.get(triangleCandidate);
                const sharedVertices = intersectionOfSets(verticesOfCandidate, vertexIndices);
                return {
                    sharedVertices,
                    triangleCandidate
                }
            }).filter(cand => cand.sharedVertices.size == 2);

            if (trianglesWithTwoSharedVertices.length < 3) {
                borderTriangles.add(triangleIndex);
                borderTrianglesToTrianglesWithSharedVertices.set(triangleIndex, triangleCandidates);
            }
        }

        // border vertices are vertices of border triangles that are shared with other border triangles
        // therefore, they correspond to stars at the edge of the empire
        const borderVertices = new Set();
        for (let borderTriangle of borderTriangles) {
            const trianglesWithSharedVertices = borderTrianglesToTrianglesWithSharedVertices.get(borderTriangle);
            const sharedBorderTriangles = Array.from(trianglesWithSharedVertices).filter(tr => borderTriangles.has(tr));
            for (let sharedBorderTriangle of sharedBorderTriangles) {
                const commonVertices = intersectionOfSets(triangleIndexToVertexIndices.get(borderTriangle), triangleIndexToVertexIndices.get(sharedBorderTriangle));
                for (let commonVertex of commonVertices) {
                    borderVertices.add(commonVertex);
                }
            }
        }

        const highestHyperspaceLevel = maxBy(player => player.research.hyperspace.level, game.galaxy.players);
        const highestHyperspaceDistance = this.distanceService.getHyperspaceDistance(game, highestHyperspaceLevel);

        const enemyStars = game.galaxy.stars.filter(star => star.ownedByPlayerId && star.ownedByPlayerId !== player._id);
        const borderStarScores = new Map();
        for (let borderVertex of borderVertices) {
            const borderStar = playerStars[borderVertex];
            const distanceToClosesEnemyStar = minBy(es => distanceService.getDistanceBetweenLocations(es.location, borderStar.location), enemyStars);
            const distanceRelative = distanceToClosesEnemyStar / highestHyperspaceDistance;
            // if the star is far from any enemy, there's no need to fortify it now.
            if (distanceRelative < 2.5) {
                // give highest priority to stars closest to the enemy
                const score = 1 / distanceRelative;
                borderStarScores.set(borderVertex, score);
            }
        }
    }

    async _playFirstTick(game, player) {
        if (!player.credits || player.credits < 0) {
            return
        }

        // On the first tick after production:
        // 1. Bulk upgrade X% of credits to ind and sci.
        let creditsToSpendSci = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_SCI_PERCENTAGE);
        let creditsToSpendInd = Math.floor(player.credits / 100 * FIRST_TICK_BULK_UPGRADE_IND_PERCENTAGE);

        if (creditsToSpendSci) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'science', creditsToSpendSci, false);
        }

        if (creditsToSpendInd) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'industry', creditsToSpendInd, false);
        }
    }

    async _playLastTick(game, player) {
        if (!player.credits || player.credits <= 0) {
            return
        }

        // On the last tick of the cycle:
        // 1. Spend remaining credits upgrading economy.
        let creditsToSpendEco = Math.floor(player.credits / 100 * LAST_TICK_BULK_UPGRADE_ECO_PERCENTAGE);

        if (creditsToSpendEco) {
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', 'economy', creditsToSpendEco, false);
        }
    }

};
