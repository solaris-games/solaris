<script setup lang="ts">
import ViewSubtitle from '../../components/ViewSubtitle.vue'
import PieChart from '../../game/components/intel/PieChart.vue'
import PolarAreaChart from '../../game/components/intel/PolarAreaChart.vue'
import {computed, onMounted, ref, type Ref} from 'vue';
import type {AchievementsUser} from "@solaris-common";

const props = defineProps<{
  user: AchievementsUser<string>,
}>();

const user = computed(() => props.user);
const levelSrc = computed(() => new URL(`../../../assets/levels/${user.value.achievements.level}.png`, import.meta.url).href);

const pieChartOptions = {
  legend: {
    display: false
  }
};

const militaryChartOptions = {
  legend: {
    display: false
  },
  tooltips: {
    callbacks: {
      title: function (tooltipItems, data) {
        return data.datasets[tooltipItems[0].datasetIndex].label
      },
      label: function (tooltipItem, data) {
        // If the star dataset, use the label "Captured"
        // instead of "Kills"
        let label = data.labels[tooltipItem.index]

        if (tooltipItem.datasetIndex === 2) {
          label = tooltipItem.index ? 'Losses' : 'Captured'
        }

        return label + ': ' +
          data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
      }
    }
  }
};

const tradeChartOptions = {
  legend: {
    display: false
  },
  tooltips: {
    callbacks: {
      title: function (tooltipItems, data) {
        return data.datasets[tooltipItems[0].datasetIndex].label
      }
    }
  }
};

const gamesChartData: Ref<any> = ref(null);
const militaryChartData: Ref<any> = ref(null);
const infrastructureChartData: Ref<any> = ref(null);
const researchChartData: Ref<any> = ref(null);
const tradeChartData: Ref<any> = ref(null);

const loadGamesChart = () => {
  gamesChartData.value = {
    labels: [
      'Victories',
      // 'Joined',
      'Completed',
      'Defeated',
      // 'Quit',
      // 'AFK'
    ],
    datasets: [
      {
        data: [
          user.value.achievements.victories,
          // user.achievements.joined,
          user.value.achievements.completed,
          user.value.achievements.defeated,
          // user.achievements.quit,
          // user.achievements.afk
        ],
        backgroundColor: [
          '#00bc8c',
          // '#375a7f',
          '#3498DB',
          '#F39C12',
          // '#444',
          // '#E74C3C'
        ]
      }
    ]
  }
};

const loadMilitaryChart = () => {
  militaryChartData.value = {
    labels: [
      'Kills',
      'Losses'
    ],
    datasets: [
      {
        data: [
          user.value.achievements.stats.combat.kills.ships,
          user.value.achievements.stats.combat.losses.ships
        ],
        backgroundColor: [
          '#00bc8c',
          '#E74C3C'
        ],
        label: 'Ships'
      },
      {
        data: [
          user.value.achievements.stats.combat.kills.carriers,
          user.value.achievements.stats.combat.losses.carriers
        ],
        backgroundColor: [
          '#00bc8c',
          '#E74C3C'
        ],
        label: 'Carriers'
      },
      {
        data: [
          user.value.achievements.stats.combat.stars.captured,
          user.value.achievements.stats.combat.stars.lost
        ],
        backgroundColor: [
          '#00bc8c',
          '#E74C3C'
        ],
        label: 'Stars'
      }
    ]
  }
};

const loadInfrastructureChart = () => {
  infrastructureChartData.value = {
    labels: [
      'Economy',
      'Industry',
      'Science'
    ],
    datasets: [{
      data: [
        user.value.achievements.stats.infrastructure.economy,
        user.value.achievements.stats.infrastructure.industry,
        user.value.achievements.stats.infrastructure.science
      ],
      backgroundColor: [
        '#00bc8c',
        '#F39C12',
        '#3498DB'
      ]
    }]
  }
};

const loadResearchChart = () => {
  researchChartData.value = {
    labels: [
      'Scanning',
      'Hyperspace',
      'Terraforming',
      'Weapons',
      'Banking',
      'Manufacturing',
      'Experimentation',
      'Specialists'
    ],
    datasets: [{
      data: [
        user.value.achievements.stats.research.scanning,
        user.value.achievements.stats.research.hyperspace,
        user.value.achievements.stats.research.terraforming,
        user.value.achievements.stats.research.weapons,
        user.value.achievements.stats.research.banking,
        user.value.achievements.stats.research.manufacturing,
        user.value.achievements.stats.research.experimentation,
        user.value.achievements.stats.research.specialists
      ],
      backgroundColor: [
        '#888',
        '#375a7f',
        '#444',
        '#F39C12',
        '#E74C3C',
        '#00bc8c',
        '#3498DB',
        '#333'
      ]
    }]
  }
};

const loadTradeChart = () => {
  tradeChartData.value = {
    labels: [
      'Sent',
      'Received'
    ],
    datasets: [
      {
        data: [
          user.value.achievements.stats.trade.creditsSent,
          user.value.achievements.stats.trade.creditsReceived
        ],
        backgroundColor: [
          '#00bc8c',
          '#3498DB'
        ],
        label: 'Credits'
      },
      {
        data: [
          user.value.achievements.stats.trade.creditsSpecialistsSent,
          user.value.achievements.stats.trade.creditsSpecialistsReceived
        ],
        backgroundColor: [
          '#00bc8c',
          '#3498DB'
        ],
        label: 'Specialist Tokens'
      },
      {
        data: [
          user.value.achievements.stats.trade.technologySent,
          user.value.achievements.stats.trade.technologyReceived
        ],
        backgroundColor: [
          '#00bc8c',
          '#3498DB'
        ],
        label: 'Technology'
      },
      {
        data: [
          user.value.achievements.renownSent,
          user.value.achievements.renown
        ],
        backgroundColor: [
          '#00bc8c',
          '#3498DB'
        ],
        label: 'Renown'
      },
      {
        data: [
          user.value.achievements.stats.trade.giftsSent,
          user.value.achievements.stats.trade.giftsReceived
        ],
        backgroundColor: [
          '#00bc8c',
          '#3498DB'
        ],
        label: 'Gifts'
      }
    ]
  }
}

onMounted(async () => {
  loadGamesChart()
  loadMilitaryChart()
  loadInfrastructureChart()
  loadResearchChart()
  loadTradeChart()
})

</script>

<template>
  <view-subtitle title="Rank" class="mt-2"/>
  <div class="row" v-if="user">
    <div class="col-12 table-responsive">
      <table v-if="user.level" class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Rank</td>
          <td class="text-end">
            <img class="user-level-icon" :src="levelSrc">
            {{ user.level.name }}
          </td>
        </tr>
        <tr>
          <td>Rank Points</td>
          <td class="text-end">{{ user.achievements.rank }}</td>
        </tr>
        <tr v-if="user.level.rankPointsNext != null">
          <td>Next Rank Points</td>
          <td class="text-end">{{ user.level.rankPointsNext }}</td>
        </tr>
        <tr>
          <td>ELO <i class="fas fa-question-circle" title="Improve your ELO by participating in 1v1's"></i></td>
          <td class="text-end">{{ user.achievements.eloRating || 1200 }}</td>
        </tr>
        <tr>
          <td>Victories</td>
          <td class="text-end">{{ user.achievements.victories }}</td>
        </tr>
        <tr>
          <td>Victories (1 vs. 1)</td>
          <td class="text-end">{{ user.achievements.victories1v1 }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

  <view-subtitle title="Games" class="mt-2"/>
  <div class="row" v-if="user">
    <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Joined</td>
          <td class="text-end">{{ user.achievements.joined }}</td>
        </tr>
        <tr>
          <td>Completed</td>
          <td class="text-end">{{ user.achievements.completed }}</td>
        </tr>
        <tr>
          <td>Defeated</td>
          <td class="text-end">{{ user.achievements.defeated }}</td>
        </tr>
        <tr>
          <td>Defeated (1 vs. 1)</td>
          <td class="text-end">{{ user.achievements.defeated1v1 }}</td>
        </tr>
        <tr>
          <td>Quit</td>
          <td class="text-end">{{ user.achievements.quit }}</td>
        </tr>
        <tr>
          <td>AFK</td>
          <td class="text-end">{{ user.achievements.afk }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="d-none d-md-block col-4">
      <polar-area-chart v-if="gamesChartData" :chart-data="gamesChartData" :options="pieChartOptions"/>
    </div>
  </div>

  <view-subtitle title="Military"/>
  <div class="row" v-if="user">
    <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Ship Kills</td>
          <td class="text-end">{{ user.achievements.stats.combat.kills.ships }}</td>
        </tr>
        <tr>
          <td>Ship Losses</td>
          <td class="text-end">{{ user.achievements.stats.combat.losses.ships }}</td>
        </tr>
        <tr>
          <td>Carrier Kills</td>
          <td class="text-end">{{ user.achievements.stats.combat.kills.carriers }}</td>
        </tr>
        <tr>
          <td>Carrier Losses</td>
          <td class="text-end">{{ user.achievements.stats.combat.losses.carriers }}</td>
        </tr>
        <tr>
          <td>Specialist Kills</td>
          <td class="text-end">{{ user.achievements.stats.combat.kills.specialists }}</td>
        </tr>
        <tr>
          <td>Specialist Losses</td>
          <td class="text-end">{{ user.achievements.stats.combat.losses.specialists }}</td>
        </tr>
        <tr>
          <td>Stars Captured</td>
          <td class="text-end">{{ user.achievements.stats.combat.stars.captured }}</td>
        </tr>
        <tr>
          <td>Stars Lost</td>
          <td class="text-end">{{ user.achievements.stats.combat.stars.lost }}</td>
        </tr>
        <tr>
          <td>Capital Stars Captured</td>
          <td class="text-end">{{ user.achievements.stats.combat.homeStars.captured }}</td>
        </tr>
        <tr>
          <td>Capital Stars Lost</td>
          <td class="text-end">{{ user.achievements.stats.combat.homeStars.lost }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="d-none d-md-block col-4">
      <pie-chart v-if="militaryChartData" :chart-data="militaryChartData" :options="militaryChartOptions"/>
    </div>
  </div>

  <view-subtitle title="Infrastructure"/>
  <div class="row" v-if="user">
    <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Economy</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.economy }}</td>
        </tr>
        <tr>
          <td>Industry</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.industry }}</td>
        </tr>
        <tr>
          <td>Science</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.science }}</td>
        </tr>
        <tr>
          <td>Warp Gates Built</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.warpGates }}</td>
        </tr>
        <tr>
          <td>Warp Gates Destroyed</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.warpGatesDestroyed }}</td>
        </tr>
        <tr>
          <td>Specialists Hired</td>
          <td class="text-end">{{ user.achievements.stats.infrastructure.specialistsHired }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="d-none d-md-block col-4">
      <pie-chart v-if="infrastructureChartData" :chart-data="infrastructureChartData" :options="pieChartOptions"/>
    </div>
  </div>

  <view-subtitle title="Research"/>
  <div class="row" v-if="user">
    <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Scanning</td>
          <td class="text-end">{{ user.achievements.stats.research.scanning }}</td>
        </tr>
        <tr>
          <td>Hyperspace</td>
          <td class="text-end">{{ user.achievements.stats.research.hyperspace }}</td>
        </tr>
        <tr>
          <td>Terraforming</td>
          <td class="text-end">{{ user.achievements.stats.research.terraforming }}</td>
        </tr>
        <tr>
          <td>Weapons</td>
          <td class="text-end">{{ user.achievements.stats.research.weapons }}</td>
        </tr>
        <tr>
          <td>Banking</td>
          <td class="text-end">{{ user.achievements.stats.research.banking }}</td>
        </tr>
        <tr>
          <td>Manufacturing</td>
          <td class="text-end">{{ user.achievements.stats.research.manufacturing }}</td>
        </tr>
        <tr>
          <td>Experimentation</td>
          <td class="text-end">{{ user.achievements.stats.research.experimentation }}</td>
        </tr>
        <tr>
          <td>Specialists</td>
          <td class="text-end">{{ user.achievements.stats.research.specialists }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="d-none d-md-block col-4">
      <pie-chart v-if="researchChartData" :chart-data="researchChartData" :options="pieChartOptions"/>
    </div>
  </div>

  <view-subtitle title="Trade"/>
  <div class="row" v-if="user">
    <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
        <tr>
          <td>Credits Sent</td>
          <td class="text-end">{{ user.achievements.stats.trade.creditsSent }}</td>
        </tr>
        <tr>
          <td>Credits Received</td>
          <td class="text-end">{{ user.achievements.stats.trade.creditsReceived }}</td>
        </tr>
        <tr>
          <td>Specialist Tokens Sent</td>
          <td class="text-end">{{ user.achievements.stats.trade.creditsSpecialistsSent }}</td>
        </tr>
        <tr>
          <td>Specialist Tokens Received</td>
          <td class="text-end">{{ user.achievements.stats.trade.creditsSpecialistsReceived }}</td>
        </tr>
        <tr>
          <td>Technology Sent</td>
          <td class="text-end">{{ user.achievements.stats.trade.technologySent }}</td>
        </tr>
        <tr>
          <td>Technology Received</td>
          <td class="text-end">{{ user.achievements.stats.trade.technologyReceived }}</td>
        </tr>
        <tr>
          <td>Gifts Sent</td>
          <td class="text-end">{{ user.achievements.stats.trade.giftsSent }}</td>
        </tr>
        <tr>
          <td>Gifts Received</td>
          <td class="text-end">{{ user.achievements.stats.trade.giftsReceived }}</td>
        </tr>
        <tr>
          <td>Renown Sent</td>
          <td class="text-end">{{ user.achievements.renownSent }}</td>
        </tr>
        <tr>
          <td>Renown Received</td>
          <td class="text-end">{{ user.achievements.renown }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="d-none d-md-block col-4">
      <pie-chart v-if="tradeChartData" :chart-data="tradeChartData" :options="tradeChartOptions"/>
    </div>
  </div>
</template>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
