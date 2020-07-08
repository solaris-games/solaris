module.exports = class TechnologyService {

    getEnabledTechnologies(game) {
        let techs = Object.keys(game.settings.technology.researchCosts).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        return techs.filter(t => this.isTechnologyEnabled(game, t));
    }

    isTechnologyEnabled(game, techKey) {
        return game.settings.technology.researchCosts[techKey] !== 'none';
    }

}