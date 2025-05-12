<template>
  <view-container>
    <view-title :title="user ? user.username : 'Achievements'" />

    <roles :user="user" :displayText="true" />

    <loading-spinner :loading="!user" />

    <user-guild-info :user="user" />

    <achievements v-if="user" :level="user.achievements.level" :victories="user.achievements.victories"
      :rank="user.achievements.rank" :renown="user.achievements.renown" />

    <user-badges :userId="userId" />

    <view-subtitle title="Rank" class="mt-2" />
    <div class="row" v-if="user">
      <div class="col-12 table-responsive">
        <table class="table table-striped table-hover">
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

    <view-subtitle title="Games" class="mt-2" />
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
        <polar-area-chart v-if="gamesChartData" :chart-data="gamesChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Military" />
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Ship Kills</td>
              <td class="text-end">{{ user.achievements.combat.kills.ships }}</td>
            </tr>
            <tr>
              <td>Ship Losses</td>
              <td class="text-end">{{ user.achievements.combat.losses.ships }}</td>
            </tr>
            <tr>
              <td>Carrier Kills</td>
              <td class="text-end">{{ user.achievements.combat.kills.carriers }}</td>
            </tr>
            <tr>
              <td>Carrier Losses</td>
              <td class="text-end">{{ user.achievements.combat.losses.carriers }}</td>
            </tr>
            <tr>
              <td>Specialist Kills</td>
              <td class="text-end">{{ user.achievements.combat.kills.specialists }}</td>
            </tr>
            <tr>
              <td>Specialist Losses</td>
              <td class="text-end">{{ user.achievements.combat.losses.specialists }}</td>
            </tr>
            <tr>
              <td>Stars Captured</td>
              <td class="text-end">{{ user.achievements.combat.stars.captured }}</td>
            </tr>
            <tr>
              <td>Stars Lost</td>
              <td class="text-end">{{ user.achievements.combat.stars.lost }}</td>
            </tr>
            <tr>
              <td>Capital Stars Captured</td>
              <td class="text-end">{{ user.achievements.combat.homeStars.captured }}</td>
            </tr>
            <tr>
              <td>Capital Stars Lost</td>
              <td class="text-end">{{ user.achievements.combat.homeStars.lost }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="militaryChartData" :chart-data="militaryChartData" :options="militaryChartOptions" />
      </div>
    </div>

    <view-subtitle title="Infrastructure" />
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Economy</td>
              <td class="text-end">{{ user.achievements.infrastructure.economy }}</td>
            </tr>
            <tr>
              <td>Industry</td>
              <td class="text-end">{{ user.achievements.infrastructure.industry }}</td>
            </tr>
            <tr>
              <td>Science</td>
              <td class="text-end">{{ user.achievements.infrastructure.science }}</td>
            </tr>
            <tr>
              <td>Warp Gates Built</td>
              <td class="text-end">{{ user.achievements.infrastructure.warpGates }}</td>
            </tr>
            <tr>
              <td>Warp Gates Destroyed</td>
              <td class="text-end">{{ user.achievements.infrastructure.warpGatesDestroyed }}</td>
            </tr>
            <tr>
              <td>Specialists Hired</td>
              <td class="text-end">{{ user.achievements.infrastructure.specialistsHired }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="infrastructureChartData" :chart-data="infrastructureChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Research" />
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Scanning</td>
              <td class="text-end">{{ user.achievements.research.scanning }}</td>
            </tr>
            <tr>
              <td>Hyperspace</td>
              <td class="text-end">{{ user.achievements.research.hyperspace }}</td>
            </tr>
            <tr>
              <td>Terraforming</td>
              <td class="text-end">{{ user.achievements.research.terraforming }}</td>
            </tr>
            <tr>
              <td>Weapons</td>
              <td class="text-end">{{ user.achievements.research.weapons }}</td>
            </tr>
            <tr>
              <td>Banking</td>
              <td class="text-end">{{ user.achievements.research.banking }}</td>
            </tr>
            <tr>
              <td>Manufacturing</td>
              <td class="text-end">{{ user.achievements.research.manufacturing }}</td>
            </tr>
            <tr>
              <td>Experimentation</td>
              <td class="text-end">{{ user.achievements.research.experimentation }}</td>
            </tr>
            <tr>
              <td>Specialists</td>
              <td class="text-end">{{ user.achievements.research.specialists }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="researchChartData" :chart-data="researchChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Trade" />
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Credits Sent</td>
              <td class="text-end">{{ user.achievements.trade.creditsSent }}</td>
            </tr>
            <tr>
              <td>Credits Received</td>
              <td class="text-end">{{ user.achievements.trade.creditsReceived }}</td>
            </tr>
            <tr>
              <td>Specialist Tokens Sent</td>
              <td class="text-end">{{ user.achievements.trade.creditsSpecialistsSent }}</td>
            </tr>
            <tr>
              <td>Specialist Tokens Received</td>
              <td class="text-end">{{ user.achievements.trade.creditsSpecialistsReceived }}</td>
            </tr>
            <tr>
              <td>Technology Sent</td>
              <td class="text-end">{{ user.achievements.trade.technologySent }}</td>
            </tr>
            <tr>
              <td>Technology Received</td>
              <td class="text-end">{{ user.achievements.trade.technologyReceived }}</td>
            </tr>
            <tr>
              <td>Gifts Sent</td>
              <td class="text-end">{{ user.achievements.trade.giftsSent }}</td>
            </tr>
            <tr>
              <td>Gifts Received</td>
              <td class="text-end">{{ user.achievements.trade.giftsReceived }}</td>
            </tr>
            <tr>
              <td>Renown Sent</td>
              <td class="text-end">{{ user.achievements.trade.renownSent }}</td>
            </tr>
            <tr>
              <td>Renown Received</td>
              <td class="text-end">{{ user.achievements.renown }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="tradeChartData" :chart-data="tradeChartData" :options="tradeChartOptions" />
      </div>
    </div>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner.vue'
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import ViewSubtitle from '../components/ViewSubtitle.vue'
import Achievements from '../game/components/player/Achievements.vue'
import PieChart from '../game/components/intel/PieChart.vue'
import PolarArea from '../game/components/intel/PolarAreaChart.vue'
import UserGuildInfoVue from '../guild/components/UserGuildInfo.vue'
import Roles from '../game/components/player/Roles.vue'
import UserBadges from '../game/components/badges/UserBadges.vue'
import { inject } from 'vue';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { getAchievements } from '@/services/typedapi/user'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'achievements': Achievements,
    'pie-chart': PieChart,
    'polar-area-chart': PolarArea,
    'user-guild-info': UserGuildInfoVue,
    'roles': Roles,
    'user-badges': UserBadges
  },
  setup() {
    return {
      httpClient: inject(httpInjectionKey)
    }
  },
  data() {
    return {
      user: null,
      gamesChartData: null,
      tradeChartData: null,
      achievements: null,
      militaryChartData: null,
      infrastructureChartData: null,
      researchChartData: null,
      pieChartOptions: {
        legend: {
          display: false
        }
      },
      militaryChartOptions: {
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
      },
      tradeChartOptions: {
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
      }
    }
  },
  async mounted() {
    const response = await getAchievements(this.httpClient)(this.userId);

    if (isOk(response)) {
      this.user = response.data

      this.loadGamesChart()
      this.loadMilitaryChart()
      this.loadInfrastructureChart()
      this.loadResearchChart()
      this.loadTradeChart()
    } else {
      console.error(formatError(response));
    }
  },
  methods: {
    loadGamesChart() {
      this.gamesChartData = null

      let chartData = {
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
              this.user.achievements.victories,
              // this.user.achievements.joined,
              this.user.achievements.completed,
              this.user.achievements.defeated,
              // this.user.achievements.quit,
              // this.user.achievements.afk
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

      this.gamesChartData = chartData
    },
    loadMilitaryChart() {
      this.militaryChartData = null

      let chartData = {
        labels: [
          'Kills',
          'Losses'
        ],
        datasets: [
          {
            data: [
              this.user.achievements.combat.kills.ships,
              this.user.achievements.combat.losses.ships
            ],
            backgroundColor: [
              '#00bc8c',
              '#E74C3C'
            ],
            label: 'Ships'
          },
          {
            data: [
              this.user.achievements.combat.kills.carriers,
              this.user.achievements.combat.losses.carriers
            ],
            backgroundColor: [
              '#00bc8c',
              '#E74C3C'
            ],
            label: 'Carriers'
          },
          {
            data: [
              this.user.achievements.combat.stars.captured,
              this.user.achievements.combat.stars.lost
            ],
            backgroundColor: [
              '#00bc8c',
              '#E74C3C'
            ],
            label: 'Stars'
          }
        ]
      }

      this.militaryChartData = chartData
    },
    loadInfrastructureChart() {
      this.infrastructureChartData = null

      let chartData = {
        labels: [
          'Economy',
          'Industry',
          'Science'
        ],
        datasets: [{
          data: [
            this.user.achievements.infrastructure.economy,
            this.user.achievements.infrastructure.industry,
            this.user.achievements.infrastructure.science
          ],
          backgroundColor: [
            '#00bc8c',
            '#F39C12',
            '#3498DB'
          ]
        }]
      }

      this.infrastructureChartData = chartData
    },
    loadResearchChart() {
      this.researchChartData = null

      let chartData = {
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
            this.user.achievements.research.scanning,
            this.user.achievements.research.hyperspace,
            this.user.achievements.research.terraforming,
            this.user.achievements.research.weapons,
            this.user.achievements.research.banking,
            this.user.achievements.research.manufacturing,
            this.user.achievements.research.experimentation,
            this.user.achievements.research.specialists
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

      this.researchChartData = chartData
    },
    loadTradeChart() {
      this.tradeChartData = null

      let chartData = {
        labels: [
          'Sent',
          'Received'
        ],
        datasets: [
          {
            data: [
              this.user.achievements.trade.creditsSent,
              this.user.achievements.trade.creditsReceived
            ],
            backgroundColor: [
              '#00bc8c',
              '#3498DB'
            ],
            label: 'Credits'
          },
          {
            data: [
              this.user.achievements.trade.creditsSpecialistsSent,
              this.user.achievements.trade.creditsSpecialistsReceived
            ],
            backgroundColor: [
              '#00bc8c',
              '#3498DB'
            ],
            label: 'Specialist Tokens'
          },
          {
            data: [
              this.user.achievements.trade.technologySent,
              this.user.achievements.trade.technologyReceived
            ],
            backgroundColor: [
              '#00bc8c',
              '#3498DB'
            ],
            label: 'Technology'
          },
          {
            data: [
              this.user.achievements.trade.renownSent,
              this.user.achievements.renown
            ],
            backgroundColor: [
              '#00bc8c',
              '#3498DB'
            ],
            label: 'Renown'
          },
          {
            data: [
              this.user.achievements.trade.giftsSent,
              this.user.achievements.trade.giftsReceived
            ],
            backgroundColor: [
              '#00bc8c',
              '#3498DB'
            ],
            label: 'Gifts'
          }
        ]
      }

      this.tradeChartData = chartData
    }
  },
  computed: {
    userId: function () {
      return this.$route.params.userId
    },
    levelSrc() {
      return new URL(`../../assets/levels/${this.user.achievements.level}.png`, import.meta.url).href
    },
  }
}
</script>

<style scoped>
.user-level-icon {
  height: 28px;
}
</style>
