const StarDistanceService = require('../services/starDistance');

describe('star distance', () => {

    let service;

    beforeEach(() => {
        // service = new StarDistanceService();
    });

    // it('should generate stars that are above minimum distance', () => {
    //     const stars = mapService.generateStars(starCount, playerCount);
        
    //     for(let i = 0; i < stars.length; i++) {
    //         let star = stars[i];

    //         let closeStars = stars.filter(s => {
    //             let distance = mapService.getDistanceBetweenStars(star, s);
                
    //             // Distance greater than 0 because we may be checking against the same star.
    //             return distance > 0;
    //         });

    //         expect(closeStars.length).toEqual(0);
    //     }
    // });

    // it('should generate stars with positive x and y co-ordinates', () => {
    //     const stars = mapService.generateStars(starCount, playerCount);
        
    //     let negatives = stars.filter(s => s.location.x < 0 || s.location.y < 0);

    //     expect(negatives.length).toEqual(0);
    // });

    // it('should generate stars with no duplicate positions.', () => {
    //     const stars = mapService.generateStars(starCount, playerCount);
        
    //     for(let i = 0; i < stars.length; i++) {
    //         let star = stars[i];

    //         let duplicates = stars.filter(s => {
    //             let distance = mapService.getDistanceBetweenStars(star, s);
                
    //             return distance == 0;
    //         });

    //         // Should equal 1 because we are checking against the same star.
    //         expect(duplicates.length).toEqual(1);
    //     }
    // });
    
});
