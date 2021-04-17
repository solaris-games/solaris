<template>
  <tr>
    <td class="row-icon"><i class="fas" :class="iconClass"></i></td>
    <td>{{ title }}</td>
    <td class="text-right" :class="playerStyle">
      {{ playerResearchLevel }}
    </td>
    <td
      v-if="userPlayer && player != userPlayer"
      class="text-right"
      :class="userPlayerStyle"
    >
      {{ userPlayerResearchLevel }}
    </td>
  </tr>
</template>
<script>
import gameHelper from "../../../services/gameHelper";

export default {
  props: {
    player: Object,
    userPlayer: Object,
    research: String,
    title: String,
    iconClass: String,
  },
  computed: {
    playerResearchLevel() {
      return this.player.research[this.research].level;
    },
    userPlayerResearchLevel() {
      return this.userPlayer.research[this.research].level;
    },
    playerStyle() {
      return {
        "text-success":
          this.userPlayer &&
          this.player == this.userPlayer &&
          this.hasHighestTechLevel(this.research),
        "text-danger":
          this.userPlayer &&
          this.player == this.userPlayer &&
          this.hasLowestTechLevel(this.research),
      };
    },
    userPlayerStyle() {
        if (this.userPlayer) {
            return {
                "text-success": this.playerResearchLevel < this.userPlayerResearchLevel,
                "text-danger": this.playerResearchLevel > this.userPlayerResearchLevel
            };
        } else {
            return {}
        }
    },
  },
  methods: {
    hasHighestTechLevel(techKey) {
      return gameHelper.userPlayerHasHighestTechLevel(
        this.$store.state.game,
        techKey
      );
    },
    hasLowestTechLevel(techKey) {
      return gameHelper.userPlayerHasLowestTechLevel(
        this.$store.state.game,
        techKey
      );
    },
  },
};
</script>
<style scoped>
</style>