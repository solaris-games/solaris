<template>
  <view-container>
    <view-title :title="user ? user.username : 'Achievements'" />

    <div class="row bg-success mb-2" v-if="user && user.roles.contributor">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          This player is a contributor <i class="fas fa-hands-helping"></i>
        </p>
      </div>
    </div>

    <div class="row bg-warning mb-2" v-if="user && user.roles.developer">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          This player is an active developer <i class="fas fa-code"></i>
        </p>
      </div>
    </div>

    <div class="row bg-info mb-2" v-if="user && user.roles.communityManager">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          This player is an active community manager <i class="fas fa-user-friends"></i>
        </p>
      </div>
    </div>

    <div class="row bg-info mb-2" v-if="user && user.roles.gameMaster">
      <div class="col text-center">
        <p class="mt-1 mb-1">
          This player is an active game master <i class="fas fa-dice"></i>
        </p>
      </div>
    </div>

    <loading-spinner :loading="!user"/>

    <div class="row bg-secondary mb-2 p-2" v-if="user && user.guild">
      <h5 class="mb-0">
        <span>Member of: </span>
        <router-link :to="{ name: 'guild-details', params: { guildId: user.guild._id }}">
          <span>{{user.guild.name}} [{{user.guild.tag}}]</span>
        </router-link>
      </h5>
    </div>

    <div class="row bg-secondary mb-2 p-2" v-if="user && !user.guild && myGuild && ownUserCanInvite()">
      <h5 v-if="isUserInvited()">This player is already invited into your guild</h5>
      <div v-if="!isUserInvited()">
        <button class="btn btn-success" @click="inviteUser">
          <i class="fas fa-user-plus"></i>
          Invite
        </button>
      </div>
    </div>

    <achievements v-if="user" v-bind:victories="user.achievements.victories" v-bind:rank="user.achievements.rank" v-bind:renown="user.achievements.renown"/>

    <p class="text-center pt-3 mb-3">Detailed statistics are listed below.</p>

    <view-subtitle title="Games"/>
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Victories</td>
            <td class="text-right">{{ user.achievements.victories }}</td>
          </tr>
          <tr>
            <td>ELO <i class="fas fa-question-circle" title="Improve your ELO by participating in 1v1's"></i></td>
            <td class="text-right">{{ user.achievements.eloRating || 1200 }}</td>
          </tr>
          <tr>
            <td>Joined</td>
            <td class="text-right">{{ user.achievements.joined }}</td>
          </tr>
          <tr>
            <td>Completed</td>
            <td class="text-right">{{ user.achievements.completed }}</td>
          </tr>
          <tr>
            <td>Defeated</td>
            <td class="text-right">{{ user.achievements.defeated }}</td>
          </tr>
          <tr>
            <td>Quit</td>
            <td class="text-right">{{ user.achievements.quit }}</td>
          </tr>
          <tr>
            <td>AFK</td>
            <td class="text-right">{{ user.achievements.afk }}</td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="d-none d-md-block col-4">
        <polar-area-chart v-if="gamesChartData" :chart-data="gamesChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Military"/>
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Ship Kills</td>
              <td class="text-right">{{ user.achievements.combat.kills.ships }}</td>
            </tr>
            <tr>
              <td>Ship Losses</td>
              <td class="text-right">{{ user.achievements.combat.losses.ships }}</td>
            </tr>
            <tr>
              <td>Carrier Kills</td>
              <td class="text-right">{{ user.achievements.combat.kills.carriers }}</td>
            </tr>
            <tr>
              <td>Carrier Losses</td>
              <td class="text-right">{{ user.achievements.combat.losses.carriers }}</td>
            </tr>
            <tr>
              <td>Specialist Kills</td>
              <td class="text-right">{{ user.achievements.combat.kills.specialists }}</td>
            </tr>
            <tr>
              <td>Specialist Losses</td>
              <td class="text-right">{{ user.achievements.combat.losses.specialists }}</td>
            </tr>
            <tr>
              <td>Stars Captured</td>
              <td class="text-right">{{ user.achievements.combat.stars.captured }}</td>
            </tr>
            <tr>
              <td>Stars Lost</td>
              <td class="text-right">{{ user.achievements.combat.stars.lost }}</td>
            </tr>
            <tr>
              <td>Capital Stars Captured</td>
              <td class="text-right">{{ user.achievements.combat.homeStars.captured }}</td>
            </tr>
            <tr>
              <td>Capital Stars Lost</td>
              <td class="text-right">{{ user.achievements.combat.homeStars.lost }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="militaryChartData" :chart-data="militaryChartData" :options="militaryChartOptions" />
      </div>
    </div>

    <view-subtitle title="Infrastructure"/>
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Economy</td>
              <td class="text-right">{{ user.achievements.infrastructure.economy }}</td>
            </tr>
            <tr>
              <td>Industry</td>
              <td class="text-right">{{ user.achievements.infrastructure.industry }}</td>
            </tr>
            <tr>
              <td>Science</td>
              <td class="text-right">{{ user.achievements.infrastructure.science }}</td>
            </tr>
            <tr>
              <td>Warp Gates Built</td>
              <td class="text-right">{{ user.achievements.infrastructure.warpGates }}</td>
            </tr>
            <tr>
              <td>Warp Gates Destroyed</td>
              <td class="text-right">{{ user.achievements.infrastructure.warpGatesDestroyed }}</td>
            </tr>
            <tr>
              <td>Specialists Hired</td>
              <td class="text-right">{{ user.achievements.infrastructure.specialistsHired }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="infrastructureChartData" :chart-data="infrastructureChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Research"/>
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Scanning</td>
              <td class="text-right">{{ user.achievements.research.scanning }}</td>
            </tr>
            <tr>
              <td>Hyperspace</td>
              <td class="text-right">{{ user.achievements.research.hyperspace }}</td>
            </tr>
            <tr>
              <td>Terraforming</td>
              <td class="text-right">{{ user.achievements.research.terraforming }}</td>
            </tr>
            <tr>
              <td>Weapons</td>
              <td class="text-right">{{ user.achievements.research.weapons }}</td>
            </tr>
            <tr>
              <td>Banking</td>
              <td class="text-right">{{ user.achievements.research.banking }}</td>
            </tr>
            <tr>
              <td>Manufacturing</td>
              <td class="text-right">{{ user.achievements.research.manufacturing }}</td>
            </tr>
            <tr>
              <td>Experimentation</td>
              <td class="text-right">{{ user.achievements.research.experimentation }}</td>
            </tr>
            <tr>
              <td>Specialists</td>
              <td class="text-right">{{ user.achievements.research.specialists }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="researchChartData" :chart-data="researchChartData" :options="pieChartOptions" />
      </div>
    </div>

    <view-subtitle title="Trade"/>
    <div class="row" v-if="user">
      <div class="col-sm-12 col-md-8 table-responsive">
        <table class="table table-striped table-hover">
          <tbody>
            <tr>
              <td>Credits Sent</td>
              <td class="text-right">{{ user.achievements.trade.creditsSent }}</td>
            </tr>
            <tr>
              <td>Credits Received</td>
              <td class="text-right">{{ user.achievements.trade.creditsReceived }}</td>
            </tr>
            <tr>
              <td>Specialist Tokens Sent</td>
              <td class="text-right">{{ user.achievements.trade.creditsSpecialistsSent }}</td>
            </tr>
            <tr>
              <td>Specialist Tokens Received</td>
              <td class="text-right">{{ user.achievements.trade.creditsSpecialistsReceived }}</td>
            </tr>
            <tr>
              <td>Technology Sent</td>
              <td class="text-right">{{ user.achievements.trade.technologySent }}</td>
            </tr>
            <tr>
              <td>Technology Received</td>
              <td class="text-right">{{ user.achievements.trade.technologyReceived }}</td>
            </tr>
            <tr>
              <td>Gifts Sent</td>
              <td class="text-right">{{ user.achievements.trade.giftsSent }}</td>
            </tr>
            <tr>
              <td>Gifts Received</td>
              <td class="text-right">{{ user.achievements.trade.giftsReceived }}</td>
            </tr>
            <tr>
              <td>Renown Sent</td>
              <td class="text-right">{{ user.achievements.trade.renownSent }}</td>
            </tr>
            <tr>
              <td>Renown Received</td>
              <td class="text-right">{{ user.achievements.renown }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-none d-md-block col-4">
        <pie-chart v-if="tradeChartData" :chart-data="tradeChartData" :options="tradeChartOptions" />
      </div>
    </div>

    <!--
    <view-subtitle title="Badges"/>

    <div class="container">

      <p class="text-center">In the game you are rewarded for being a tough opponent or great ally. When others enjoying playing against you they will buy you a badge.</p>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-flag"></i></h1>
        </div>
        <div class="col">
          <h5>Conqueror: <span class="text-success">{{ achievements.badges.conqueror }}</span></h5>
          <p>The badge is awarded to winners of the 32 Player Ultra Games. Players holding this badge have proven skill in both combat and diplomacy.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-skull-crossbones"></i></h1>
        </div>
        <div class="col">
          <h5>Cutthroat Pirate: <span class="text-success">{{ achievements.badges.cutthroatPirate }}</span></h5>
          <p>In this treacherous universe, it's a fine line between good and evil. This badge is for the players who tread this line with grace and mastery.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-skull"></i></h1>
        </div>
        <div class="col">
          <h5>Dead Set Badass: <span class="text-success">{{ achievements.badges.deadSetBadass }}</span></h5>
          <p>For the toughest opponents. Let other players be warned, this player shows a level of commitment that goes above and beyond.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-chess-king"></i></h1>
        </div>
        <div class="col">
          <h5>Master Strategist: <span class="text-success">{{ achievements.badges.masterStrategist }}</span></h5>
          <p>For players who had a plan and executed it with aplomb. Be they allies or enemies, some players deserve a little recognition for their achievements. </p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-pen-fancy"></i></h1>
        </div>
        <div class="col">
          <h5>Wordsmith: <span class="text-success">{{ achievements.badges.wordsmith }}</span></h5>
          <p>For the players who breathe life and flavor into the game with their commitment to roleplaying. Good show chaps!</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-paw"></i></h1>
        </div>
        <div class="col">
          <h5>Lionheart: <span class="text-success">{{ achievements.badges.lionheart }}</span></h5>
          <p>For players who show great courage in the face of adversity, holding on against all odds to support the alliance in victory! </p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-dice"></i></h1>
        </div>
        <div class="col">
          <h5>Lucky Devil: <span class="text-success">{{ achievements.badges.luckyDevil }}</span></h5>
          <p>Great tactics, awesome strategy, or just one lucky son-of-a-gun. For the player whose stars were aligned. They won't be so lucky next time!</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-pizza-slice"></i></h1>
        </div>
        <div class="col">
          <h5>Slice of Cheese: <span class="text-success">{{ achievements.badges.sliceOfCheese }}</span></h5>
          <p>Had a great game but can't decide which badge is right? Buy a slice of cheese. Who doesn't like pizza?</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-fish"></i></h1>
        </div>
        <div class="col">
          <h5>Ironborn: <span class="text-success">{{ achievements.badges.ironborn }}</span></h5>
          <p>Hard places breed hard men, and hard men rule the world. Award this badge to the Ironborn of the universe.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-fighter-jet"></i></h1>
        </div>
        <div class="col">
          <h5>Quick Draw: <span class="text-success">{{ achievements.badges.quickDraw }}</span></h5>
          <p>For the player who shoots first and asks questions later. Whether they deliver a hammer blow or are massacred, such a bold move deserves some recognition.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-satellite"></i></h1>
        </div>
        <div class="col">
          <h5>Sentinel: <span class="text-success">{{ achievements.badges.sentinel }}</span></h5>
          <p>Some players are always watching, just waiting for you to make that one crucial mistake. Why not buy that player who never seems to sleep the sentinel badge?</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-atom"></i></h1>
        </div>
        <div class="col">
          <h5>Mad Scientist: <span class="text-success">{{ achievements.badges.madScientist }}</span></h5>
          <p>For those who love the feel of a lab coat against the skin. Reward those who claim galactic dominance by pushing their research teams to the limit!</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="far fa-question-circle"></i></h1>
        </div>
        <div class="col">
          <h5>Strange One: <span class="text-success">{{ achievements.badges.strangeOne }}</span></h5>
          <p>We all seek to anticipate our opponents’ moves, but sometimes their actions defy all predictions. Why not buy them this badge to show them how confused you are by their judgements.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-biohazard"></i></h1>
        </div>
        <div class="col">
          <h5>Toxic: <span class="text-success">{{ achievements.badges.toxic }}</span></h5>
          <p>Some players just make your blood boil. Vent your spleen and label them toxic.</p>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <h1><i class="fas fa-user-friends"></i></h1>
        </div>
        <div class="col">
          <h5>Top Ally: <span class="text-success">{{ achievements.badges.topAlly }}</span></h5>
          <p>For no other reason than that you enjoyed your game with this player.</p>
        </div>
      </div>

    </div>
    -->
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import ViewSubtitle from '../components/ViewSubtitle'
import Achievements from '../components/game/player/Achievements'
import PieChart from '../components/game/intel/PieChart.js'
import PolarArea from '../components/game/intel/PolarAreaChart.js'
import userService from '../services/api/user'
import GuildApiService from '../services/api/guild'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'achievements': Achievements,
    'pie-chart': PieChart,
    'polar-area-chart': PolarArea
  },
  data () {
    return {
      user: null,
      gamesChartData: null,
      tradeChartData: null,
      achievements: null,
      militaryChartData: null,
      infrastructureChartData: null,
      researchChartData: null,
      myGuild: null,
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
  async mounted () {
    try {
      let response = await userService.getUserAchievements(this.$route.params.userId)

      this.user = response.data

      await this.loadMyGuild()
      this.loadGamesChart()
      this.loadMilitaryChart()
      this.loadInfrastructureChart()
      this.loadResearchChart()
      this.loadTradeChart()
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    async inviteUser () {
      try {
        const response = await GuildApiService.invite(this.myGuild._id, this.user.username);

        if (response.status === 200) {
          this.$toasted.show(`You invited ${this.user.username} to your guild.`, { type: 'success' })
        }
        await this.loadMyGuild();
      } catch (err) {
        console.log(err)
      }
    },
    ownUserCanInvite () {
      const userId = this.$store.state.userId;
      return this.myGuild && (this.myGuild.leader._id === userId || this.myGuild.officers.find(x => x._id === userId));
    },
    isUserInvited () {
      return this.myGuild && this.myGuild.invitees.find(inv => inv._id === this.user._id);
    },
    async loadMyGuild () {
      try {
        const response = await GuildApiService.detailMyGuild()

        if (response.status === 200) {
          this.myGuild = response.data
        }
      } catch (err) {
        console.error(err)
      }
    },
    loadGamesChart () {
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
    loadMilitaryChart () {
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
    loadInfrastructureChart () {
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
    loadResearchChart () {
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
    loadTradeChart () {
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
  }
}
</script>

<style scoped>
/* .fa-trophy {
  color: gold;
}
.fa-star {
  color: yellow;
}
.fa-heart {
  color: red;
}
.fa-flag {
  color: green;
}
.fa-skull-crossbones {
  color: #e3dac9;
}
.fa-skull {
  color: #e3dac9;
}
.fa-chess-king {
  color: burlywood;
}
.fa-pen-fancy {
  color: blueviolet;
}
.fa-paw {
  color: red;
}
.fa-dice {
  color: red;
}
.fa-pizza-slice {
  color: red;
}
.fa-fish {
  color: red;
}
.fa-fighter-jet {
  color: red;
}
.fa-satellite {
  color: red;
}
.fa-atom {
  color: red;
}
.fa-question {
  color: red;
}
.fa-biohazard {
  color: red;
}
.fa-user-friends {
  color: red;
} */
</style>
