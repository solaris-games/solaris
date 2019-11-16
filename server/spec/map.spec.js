const map = require('../data/map');

describe('map', () => {

    const starCount = 10;
    const playerCount = 2;

    it('should generate a given number of stars', () => {
        const stars = map.generateStars(starCount, playerCount);
        
        expect(stars).toBeTruthy();
        expect(stars.length).toEqual(starCount);
    });

    it('should generate stars that are above minimum distance', () => {
        const stars = map.generateStars(starCount, playerCount);
        
        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];

            let closeStars = stars.filter(s => {
                let distance = map.getDistanceBetweenStars(star, s);
                
                // Distance greater than 0 because we may be checking against the same star.
                return distance > 0 && distance < map.DISTANCES.MIN_DISTANCE_BETWEEN_STARS;
            });

            expect(closeStars.length).toEqual(0);
        }
    });

    it('should generate stars with positive x and y co-ordinates', () => {
        const stars = map.generateStars(starCount, playerCount);
        
        let negatives = stars.filter(s => s.location.x < 0 || s.location.y < 0);

        expect(negatives.length).toEqual(0);
    });

    it('should generate stars with no duplicate positions.', () => {
        const stars = map.generateStars(starCount, playerCount);
        
        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];

            let duplicates = stars.filter(s => {
                let distance = map.getDistanceBetweenStars(star, s);
                
                return distance == 0;
            });

            // Should equal 1 because we are checking against the same star.
            expect(duplicates.length).toEqual(1);
        }
    });

    it('should generate stars with no duplicate names.', () => {
        const stars = map.generateStars(starCount, playerCount);
        
        for(let i = 0; i < stars.length; i++) {
            let star = stars[i];

            let duplicates = stars.filter(s => s.name === star.name);

            // Should equal 1 because we are checking against the same star.
            expect(duplicates.length).toEqual(1);
        }
    });

});
