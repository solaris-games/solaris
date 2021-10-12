class Helpers {

    rotateCarrierTowardsWaypoint (carrier, stars, graphics) {
        // If the carrier has waypoints, get the first one and calculate the angle
        // between the carrier's current position and the destination.
        if (carrier.waypoints.length) {
            let waypoint = carrier.waypoints[0]
            let starDestination = stars.find(s => s._id === waypoint.destination)

            if (!starDestination) {
                const sourceStar = stars.find(s => s._id === waypoint.source)
                if (!sourceStar) {
                    return
                }

                const angle = this.getAngleTowardsLocation(carrier.location, sourceStar.location)
                graphics.angle = (angle * (180 / Math.PI)) - 90
                return
            }

            let destination = starDestination.location

            let angle = this.getAngleTowardsLocation(carrier.location, destination)

            graphics.angle = (angle * (180 / Math.PI)) + 90
        }
    }

    getAngleTowardsLocation (source, destination) {
      let deltaX = destination.x - source.x
      let deltaY = destination.y - source.y
  
      return Math.atan2(deltaY, deltaX)
    }

}

export default new Helpers()