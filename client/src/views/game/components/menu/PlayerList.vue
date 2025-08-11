<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item grow" v-for="p in sortedPlayers" v-bind:key="p._id" v-on:click="(e) => onPlayerClicked(p, e)"
          :title="p.colour.alias + ' ' + p.shape + ' - ' + p.alias">
          <player-avatar :player="p"/>

          <div class="colour-bar" v-bind:style="{'background-color': getPlayerColour(p)}">
          </div>
        </li>
    </ul>
</template>

<script setup lang="ts">
import gameHelper from '../../../../services/gameHelper';
import PlayerAvatar from './PlayerAvatar.vue';
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import { computed } from 'vue';
import type { Player } from '@/types/game';

const emit = defineEmits<{
  'onOpenPlayerDetailRequested': [playerId: string],
}>();

const store: Store<State> = useStore();

const sortedPlayers = computed(() => gameHelper.getSortedLeaderboardPlayerList(store.state.game));

const onPlayerClicked = (player: Player, e: MouseEvent) => {
  const click = () => emit('onOpenPlayerDetailRequested', player._id);

  const doNormalClick = store.state.settings.interface.shiftKeyMentions === 'enabled' && !e.shiftKey;
  if (doNormalClick) {
    click();
    return;
  }

  store.commit('playerClicked', {
    player,
    permitCallback: click,
  });
};

const getPlayerColour = (player: Player) => {
  return store.getters.getColourForPlayer(player._id).value;
}
</script>

<style scoped>
.list-group-item {
    padding: 0;
    border: 0;
    overflow:hidden;
    cursor: pointer;
    border-radius: 0 !important;
    height: 68px;
    width: 59px;
    min-width: 59px;
}

.colour-bar {
    min-height: 8px;
}

@media screen and (max-width: 576px) {
  .list-group-item {
      height: 40px;
      width: 35px;
      min-width: 35px;
  }

  .colour-bar {
      min-height: 4px;
  }
}

ul {
  overflow: visible;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-color: #375a7f #303030;
}

li {
  display: inline-block;
}

.grow .colour-bar { transition: all .1s linear; }
.grow:hover .colour-bar {
  transform: scale(1.5);
  transform-origin: bottom;
}
</style>
