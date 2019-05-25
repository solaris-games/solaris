<template>
  <div>
    <view-title title="Achievements" navigation="main-menu"/>

    <div>
      <p>Victories</p>
      <p>{{ achievements.victories }}</p>
    </div>

    <div>
      <p>Rank</p>
      <p>{{ achievements.rank }}</p>
    </div>

    <div>
      <p>Renown</p>
      <p>{{ achievements.renown }}</p>
    </div>

    <hr>

    <div>
      <p>Conqueror: <span>{{ achievements.badges.conqueror }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Cutthroat Pirate: <span>{{ achievements.badges.cutthroatPirate }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Dead Set Badass: <span>{{ achievements.badges.deadSetBadass }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Master Strategist: <span>{{ achievements.badges.masterStrategist }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Wordsmith: <span>{{ achievements.badges.wordsmith }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Lionheart: <span>{{ achievements.badges.lionheart }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Lucky Devil: <span>{{ achievements.badges.luckyDevil }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Slice of Chees: <span>{{ achievements.badges.sliceOfCheese }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Ironborn: <span>{{ achievements.badges.ironborn }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Quick Draw: <span>{{ achievements.badges.quickDraw }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Sentinel: <span>{{ achievements.badges.sentinel }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Mad Scientist: <span>{{ achievements.badges.madScientist }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Strange One: <span>{{ achievements.badges.strangeOne }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Toxic: <span>{{ achievements.badges.toxic }}</span></p>
      <p></p>
    </div>

    <div>
      <p>Top Ally: <span>{{ achievements.badges.topAlly }}</span></p>
      <p></p>
    </div>
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";
import apiService from '../services/apiService';

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
    return {
      achievements: null
    };
  },
  async mounted() {
    try {
      let response = await apiService.getUserInfo();

      this.achievements = response.data.achievements;
    } catch(err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
</style>
