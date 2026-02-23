import { Location } from "../services/types/Location";
import { MapObject } from "../services/types/Map";
import { Star } from "../services/types/Star";
import { DistanceService } from '@solaris-common';

interface KDTreeNode {
    objectIndex: number;
    marked?: boolean;
}

export class KDTree {
    distanceService: DistanceService;
    private nodes: KDTreeNode[] = [];
    private withinRadius: number[] = [];

    constructor(distanceService: DistanceService, readonly mapObjects: MapObject[], indices?: number[]) {
        this.distanceService = distanceService;
        this.mapObjects = mapObjects;

        if (indices != null && indices.length === mapObjects.length) {
            for (let i = 0; i < mapObjects.length; i++) {
                this.nodes.push({ objectIndex: indices[i] });
            }
        } else {
            for (let i = 0; i < mapObjects.length; i++) {
                this.nodes.push({ objectIndex: i });
            }
        }

        if (this.nodes.length > 0) {
            this.makeTree(0, this.nodes.length, 'x');
        }
    }

    makeTree(begin: number, end: number, key: keyof Location) {
        if (end <= begin) return null;

        const n = begin + Math.floor((end - begin) / 2);

        this._sortSlice(this.nodes, begin, end, key);

        const nextIndex = key === 'x' ? 'y' : 'x';

        this.makeTree(begin, n, nextIndex);
        this.makeTree(n + 1, end, nextIndex);
    }

    _sortSlice(array: KDTreeNode[], begin: number, end: number, key: keyof Location) {
        const sorted = array.slice(begin, end).sort((a, b) => this.mapObjects[a.objectIndex].location[key] - this.mapObjects[b.objectIndex].location[key]);
        array.splice(begin, end - begin, ...sorted);

        return array;
    }

    getIndices() {
        return this.nodes.map(n => n.objectIndex);
    }

    radiusSearch(query: Location, begin: number, end: number, radius: number, key: keyof Location) {
        if (end <= begin) return;

        const n = begin + Math.floor((end - begin) / 2);
        const current = this.nodes[n];

        if (current.marked) return;

        const sqDistance = this.distanceService.getDistanceSquaredBetweenLocations(query, this.mapObjects[current.objectIndex].location);

        if (sqDistance <= Math.pow(radius, 2)) {
            this.withinRadius.push(current.objectIndex);

            const left = begin + Math.floor((n - begin) / 2);
            const right = n + 1 + Math.floor((end - (n + 1)) / 2);
            if ((n <= begin || this.nodes[left].marked) && (end <= n + 1 || this.nodes[right].marked)) {
                current.marked = true;
                return;
            }
        }

        const goLeft = query[key] < this.mapObjects[current.objectIndex].location[key];

        if (goLeft) {
            this.radiusSearch(query, begin, n, radius, key === 'x' ? 'y' : 'x');
        } else {
            this.radiusSearch(query, n + 1, end, radius, key === 'x' ? 'y' : 'x');
        }

        const delta = Math.abs(query[key] - this.mapObjects[current.objectIndex].location[key]);
        if (delta < radius) {
            if (goLeft) { // Invert previous decision
                this.radiusSearch(query, n + 1, end, radius, key === 'x' ? 'y' : 'x');
            } else {
                this.radiusSearch(query, begin, n, radius, key === 'x' ? 'y' : 'x');
            }
        }
    }

    resetMarked() {
        this.nodes.forEach(n => n.marked = undefined);
    }

    getWithinRadius(target: Star, radius: number, resetMarked: boolean = false) {
        this.withinRadius = [];
        if (resetMarked) this.resetMarked();

        this.radiusSearch(target.location, 0, this.nodes.length, radius, 'x');

        return this.withinRadius;
    }

    firstValidNeighbourSearch(query: Location, begin: number, end: number, radius: number, key: keyof Location) {
        if (end <= begin) return;
        if (this.withinRadius.length > 0) return;

        const n = begin + Math.floor((end - begin) / 2);
        const current = this.nodes[n];

        const sqDistance = this.distanceService.getDistanceSquaredBetweenLocations(query, this.mapObjects[current.objectIndex].location);
        if (sqDistance <= Math.pow(radius, 2)) {
            this.withinRadius.push(current.objectIndex);
            return;
        }

        const goLeft = query[key] < this.mapObjects[current.objectIndex].location[key];

        if (goLeft) {
            this.firstValidNeighbourSearch(query, begin, n, radius, key === 'x' ? 'y' : 'x');
        } else {
            this.firstValidNeighbourSearch(query, n + 1, end, radius, key === 'x' ? 'y' : 'x');
        }

        const delta = Math.abs(query[key] - this.mapObjects[current.objectIndex].location[key]);
        if (delta < radius) {
            if (goLeft) { // Invert previous decision
                this.firstValidNeighbourSearch(query, n + 1, end, radius, key === 'x' ? 'y' : 'x');
            } else {
                this.firstValidNeighbourSearch(query, begin, n, radius, key === 'x' ? 'y' : 'x');
            }
        }
    }

    isWithinRadiusOfAny(target: Location, radius: number) {
        this.withinRadius = [];

        this.firstValidNeighbourSearch(target, 0, this.nodes.length, radius, 'x');

        return this.withinRadius.length > 0;
    }
}