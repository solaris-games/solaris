import races from '../components/data/raceDescriptions'

class RaceHelper {

    getRace(avatarId) {
        return races.find(x => x.avatars.indexOf(avatarId) > -1)
    }

}

export default new RaceHelper()
