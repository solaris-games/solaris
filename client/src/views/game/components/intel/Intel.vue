<template>
<div class="menu-page  pb-2">
  <div class="container">
    <menu-title title="Intel" @onCloseRequested="(e) => emit('onCloseRequested', e)"></menu-title>

    <loading-spinner :loading="!history"/>
  </div>

  <div v-if="history">
    <div class="container">
      <div class="row g-0">
        <div class="col">
        <select class="form-control input-sm" id="intelType" v-model="intelType" v-on:change="fillData" :disabled="history == null">
          <option key="totalStars" value="totalStars">Total Stars</option>
          <option key="totalHomeStars" value="totalHomeStars">Total Capital Stars</option>
          <option key="totalEconomy" value="totalEconomy">Total Economy</option>
          <option key="totalIndustry" value="totalIndustry">Total Industry</option>
          <option key="totalScience" value="totalScience">Total Science</option>
          <option key="totalShips" value="totalShips">Total Ships</option>
          <option key="totalCarriers" value="totalCarriers">Total Carriers</option>
          <option key="totalSpecialists" value="totalSpecialists" v-if="isSpecialistsEnabled">Total Specialists</option>
          <option key="totalStarSpecialists" value="totalStarSpecialists" v-if="isSpecialistsEnabled">Total Specialists (Stars)</option>
          <option key="totalCarrierSpecialists" value="totalCarrierSpecialists" v-if="isSpecialistsEnabled">Total Specialists (Carriers)</option>
          <option key="newShips" value="newShips">New Ships</option>
          <option key="warpgates" value="warpgates">Warpgates</option>
          <option key="weapons" value="weapons">Weapons</option>
          <option key="banking" value="banking">Banking</option>
          <option key="manufacturing" value="manufacturing">Manufacturing</option>
          <option key="hyperspace" value="hyperspace">Hyperspace</option>
          <option key="scanning" value="scanning">Scanning</option>
          <option key="experimentation" value="experimentation">Experimentation</option>
          <option key="terraforming" value="terraforming">Terraforming</option>
          <option key="specialists" value="specialists" v-if="isSpecialistsTechnologyEnabled">Specialists</option>
        </select>
        </div>
        <div class="col-auto ms-1">
          <select class="form-control input-sm" v-model="startTick" v-on:change="reloadData" :disabled="history == null">
            <option v-for="option in startTickOptions" :key="option.text" :value="option.value">
              {{option.text}}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="mb-2 mt-2 ms-1 me-1 intelchart" v-if="dataCollection != null">
        <line-chart :chart-data="dataCollection" :options="dataoptions" />
    </div>

    <div class="pt-5 pb-5 text-center" v-if="dataCollection == null">
      <h1><i class="fas fa-atom fa-spin"></i></h1>
    </div>

    <div class="container">
        <div class="row mb-2">
            <div class="col">
              <div class="btn-group">
                <button class="btn btn-outline-success" @click="showAll">All</button>
                <button class="btn btn-outline-info" @click="showActive">Active</button>
                <button class="btn btn-outline-primary" @click="showNone">
                  <span v-if="userPlayer">You</span>
                  <span v-if="!userPlayer">None</span>
                </button>
              </div>
            </div>
        </div>
        <div class="row">
          <div class="col">
            <button v-for="playerFilter in playerFilters" :key="playerFilter.playerId"
              class="btn me-1 mb-1"
              :class="{'btn-primary': playerFilter.enabled}"
              @click="togglePlayerFilter(playerFilter)"
              :title="playerFilter.alias">
              <player-icon
                :playerId="playerFilter.playerId"
                :hideOnlineStatus="true"
                :solidGlyphOnly="true"
                :colour="playerFilter.colour"
                style="margin-top:0px;margin-right:0px;"/>
            </button>
          </div>
        </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue'
import MenuTitle from '../MenuTitle.vue'
import LineChart from './LineChart.vue'
import PlayerIcon from '../player/PlayerIcon.vue'
import GameHelper from '../../../../services/gameHelper'
import {getIntel} from "@/services/typedapi/game";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import { inject, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import type {Intel, IntelPlayer} from "@solaris-common";

type DataSet = {
  label: string;
  borderColor: string;
  fill: boolean;
  pointRadius: number;
  borderWidth: number;
  pointHitRadius: number;
  data: number[];
}

type DataCollection = {
  labels: string[];
  datasets: DataSet[];
}

type PlayerFilter = {
  enabled: boolean,
  playerId: string,
  alias: string,
  shape: string,
  defeated: boolean,
  colour: string
};

type IntelType = keyof IntelPlayer<string>['statistics'] | keyof IntelPlayer<string>['research'];

const props = defineProps<{
  compareWithPlayerId?: string
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event]
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const intelType = ref<IntelType>('totalStars');
const history = ref<Intel<string>[] | null>(null);
const playerFilters = ref<PlayerFilter[]>([]);
const startTickOptions = ref<{text: string, value: number}[]>([]);
const startTick = ref<number | null>(null);

watch(startTick, () => {
  fillData();
});

const dataCollection = ref<DataCollection | null>(null);
const colourOverride = computed(() => store.state.colourOverride);

watch(colourOverride, () => {
  fillData();
});

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const isSpecialistsEnabled = computed(() => GameHelper.isSpecialistsEnabled(game.value));
const isSpecialistsTechnologyEnabled = computed(() => GameHelper.isSpecialistsTechnologyEnabled(game.value));

const dataoptions = {
  aspectRatio: 1,
  plugins: {
    legend: {
      display: false,
    }
  },
  bezierCurve: false,
  scales: {
  },
  elements: {
    line: {
      tension: 0
    }
  }
};

const fillData = () => {
  if (!history.value) {
    return;
  }

  dataCollection.value = null;

  const newDataCollection: DataCollection = {
    labels: [],
    datasets: []
  };

  const filteredHistory = startTick.value ? history.value.filter(h => h.tick >= startTick.value!) : history.value;

  newDataCollection.labels = filteredHistory.map(h => h.tick.toString());

  for (let i = 0; i < game.value.galaxy.players.length; i++) {
    const player = game.value.galaxy.players[i];
    const playerFilter = playerFilters.value.find(f => f.playerId === player._id)!;

    if (!playerFilter.enabled) {
      continue;
    }

    const isCurrentPlayer = userPlayer.value && userPlayer.value._id === player._id;

    const dataset: DataSet = {
      label: player.alias,
      borderColor: isCurrentPlayer ? '#FFFFFF' : GameHelper.getFriendlyColour(store.getters.getColourForPlayer(player._id).value),
      fill: false,
      pointRadius: 0,
      borderWidth: 3,
      pointHitRadius: 10,
      data: []
    };

    // Get all data points for the selected intel type.
    for (let e = 0; e < filteredHistory.length; e++) {
      const thisHistory = filteredHistory[e];
      const historyPlayer = thisHistory.players.find(p => p.playerId === player._id)!;

      switch (intelType.value) {
        case 'weapons':
        case 'banking':
        case 'manufacturing':
        case 'hyperspace':
        case 'scanning':
        case 'experimentation':
        case 'terraforming':
        case 'specialists':
          dataset.data.push(historyPlayer.research[intelType.value].level);
          break
        default:
          dataset.data.push(historyPlayer.statistics[intelType.value] || 0);
      }
    }

    newDataCollection.datasets.push(dataset);
  }

  dataCollection.value = newDataCollection;
};

const reloadData = async () => {
  const response = await getIntel(httpClient)(game.value._id);

  if (isOk(response)) {
    history.value = response.data;
    fillData();
  } else {
    console.error(formatError(response));
  }
};

const calculateStartTicks = () => {
  const currentTick = store.state.tick
  const prodTicks = game.value.settings.galaxy.productionTicks

  startTickOptions.value.push({
    text: `Last Cycle`,
    value: Math.max(0, currentTick - prodTicks)
  })

  for (let i = 2; i < 11; i++) {
    startTickOptions.value.push({
      text: `${i} Cycles`,
      value: Math.max(0, currentTick - (prodTicks * i))
    })
  }

  startTickOptions.value.push({
    text: 'All',
    value: 0
  })

  startTick.value = startTickOptions.value[startTickOptions.value.length - 2].value
};

const togglePlayerFilter = (playerFilter: PlayerFilter) => {
  playerFilter.enabled = !playerFilter.enabled;

  fillData();
};

const showAll = () => {
  playerFilters.value.forEach(f => f.enabled = true);
  fillData();
};

const showActive = () => {
  playerFilters.value.forEach(f => f.enabled = !f.defeated);
  fillData();
};

const showNone = () => {
  playerFilters.value.forEach(f => f.enabled = false);

  if (userPlayer.value) {
    const userFilter = playerFilters.value.find(f => f.playerId === userPlayer.value!._id);

    if (userFilter) {
      userFilter.enabled = true;
    }
  }

  fillData();
};

onMounted(async () => {
  playerFilters.value = game.value.galaxy.players.map(p => {
    const isCurrentPlayer = userPlayer.value && userPlayer.value._id === p._id

    return {
      enabled: !p.defeated, // Default to Active filter
      playerId: p._id,
      alias: p.alias,
      shape: p.shape,
      defeated: p.defeated,
      colour: isCurrentPlayer ? '#FFFFFF' : store.getters.getColourForPlayer(p._id).value
    }
  });

  if (props.compareWithPlayerId) {
    playerFilters.value.forEach(f => {
      f.enabled = Boolean(f.playerId === props.compareWithPlayerId ||
        (userPlayer.value && f.playerId === userPlayer.value._id));
    });
  }

  calculateStartTicks();
  await reloadData();
});
</script>

<style scoped>
</style>
