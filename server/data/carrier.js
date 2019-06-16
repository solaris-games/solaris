module.exports = {

    createAtStar(star) {
        if (!star.garrison) {
            throw new Error('Star must have a garrison to build a carrier.');
        }

        let carrier = {
            ships: 1,
            orbiting: star._id,
            location: star.location,
            name: star.name + ' 1' // TODO: Need to check if this name already exists.
        };

        return carrier;
    }

};
