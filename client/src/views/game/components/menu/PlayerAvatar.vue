<template>
  <div @click="onClick" class="player-icon text-center bg-dark">
    <picture class="avatar-image" v-if="player.avatar">
      <source :srcset="avatarWebpSrc" type="image/webp" />
      <img
        alt="defeated"
        :src="avatarSrc"
        :class="{ 'defeated-player': player.defeated }"
      />
    </picture>
    <i v-if="!player.avatar" class="avatar-placeholder fas fa-user"></i>
    <span class="shapeIcon">
      <player-icon :playerId="player._id" />
    </span>
    <i v-if="player.userId" class="userIcon fas fa-user"></i>
    <i v-if="hasPerspective()" class="userIcon fas fa-eye"></i>
    <i
      v-if="showMedals && isFirstPlace()"
      class="medalIcon gold fas fa-medal"
    ></i>
    <i
      v-if="showMedals && isSecondPlace()"
      class="medalIcon silver fas fa-medal"
    ></i>
    <i
      v-if="showMedals && isThirdPlace()"
      class="medalIcon bronze fas fa-medal"
    ></i>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import { computed } from "vue";
import PlayerIcon from "../player/PlayerIcon.vue";
import type { Game, Player } from "@/types/game";
import GameHelper from "../../../../services/gameHelper";

const props = defineProps<{
  player: Player;
}>();

const emit = defineEmits<{
  onClick: [];
}>();

const onClick = () => emit("onClick");

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const leaderboard = computed(() =>
  GameHelper.getSortedLeaderboardPlayerList(game.value),
);
const showMedals = computed(
  () =>
    GameHelper.isGameInProgress(game.value) ||
    GameHelper.isGameFinished(game.value),
);

const avatarSrc = computed(
  () =>
    new URL(
      `../../../../assets/avatars/${props.player.avatar}`,
      import.meta.url,
    ).href,
);
const avatarWebpSrc = computed(() => {
  const base = props.player.avatar!.replace(/\.[^.]+$/, "");
  return new URL(`../../../../assets/avatars/${base}.webp`, import.meta.url)
    .href;
});

const isFirstPlace = () => leaderboard.value.indexOf(props.player) === 0;
const isSecondPlace = () => leaderboard.value.indexOf(props.player) === 1;
const isThirdPlace = () => leaderboard.value.indexOf(props.player) === 2;

const hasPerspective = () => {
  if (GameHelper.getUserPlayer(game.value)) {
    return false;
  }

  return props.player.hasPerspective || false;
};
</script>

<style scoped>
.player-icon {
  display: grid;
  grid-template-areas: "a";
  width: 59px;
  height: 59px;
}

.player-icon .userIcon {
  grid-area: a;
  margin-left: 3px;
  margin-top: 40px;
  font-size: 16px;
}

.player-icon .shapeIcon {
  grid-area: a;
  margin-left: 40px;
  margin-top: 0;
  font-size: 16px;
}

.player-icon .medalIcon {
  grid-area: a;
  margin-left: 40px;
  margin-top: 40px;
  font-size: 16px;
}

.fa-user {
  font-size: 44px;
}

.defeated-player {
  opacity: 0.3;
}

.avatar-placeholder {
  grid-area: a;
  display: block;

  height: 59px;
  width: 59px;
}

.avatar-image {
  grid-area: a;
  display: block;

  img {
    height: 59px;
    width: 59px;
  }
}

@media screen and (max-width: 576px) {
  .player-icon {
    height: 35px;
    width: 35px;
  }

  .avatar-image {
    img {
      height: 35px;
      width: 35px;
    }
  }

  .avatar-placeholder {
    height: 35px;
    width: 35px;
  }

  .player-icon .userIcon {
    grid-area: a;
    margin-left: 3px;
    margin-top: 20px;
    font-size: 14px;
  }

  .player-icon .shapeIcon {
    grid-area: a;
    margin-left: 20px;
    margin-top: 0;
    font-size: 14px;
  }

  .player-icon .medalIcon {
    grid-area: a;
    margin-left: 20px;
    margin-top: 20px;
    font-size: 14px;
  }
}

.gold {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #b08d57;
}
</style>
