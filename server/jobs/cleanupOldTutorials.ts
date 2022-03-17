import { DependencyContainer } from "../types/DependencyContainer";

export default (container: DependencyContainer) => {

    return {

        async handler(job: any, done: any) {
            let games = await container.gameListService.listCompletedTutorials();

            for (let i = 0; i < games.length; i++) {
                let game = games[i];

                try {
                    await container.gameService.delete(game);
                } catch (e) {
                    console.error(e);
                }
            }

            done();
        }

    };
    
};
