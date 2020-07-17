<template>
  <view-container>
    <view-title :title="user ? user.username : 'Achievements'" />

    <loading-spinner :loading="!user"/>
    
    <!-- TODO: Will this look nicer on the main menu instead? -->
    <achievements v-if="user.achievements" v-bind:victories="user.achievements.victories" v-bind:rank="user.achievements.rank" v-bind:renown="user.achievements.renown"/>

    <p class="text-center pt-3 mb-0">Read more about <a href="javascript:;">Victory, Rank and Renown</a>.</p>

    <h5>Games</h5>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <tbody>
          <tr>
            <td>Victories</td>
            <td class="text-right">{{ user.achievements.victories }}</td>
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

    <h5>Military</h5>
    <div class="table-responsive">
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
            <td>Stars Captured</td>
            <td class="text-right">{{ user.achievements.combat.stars.captured }}</td>
          </tr>
          <tr>
            <td>Stars Lost</td>
            <td class="text-right">{{ user.achievements.combat.stars.lost }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h5>Infrastructure</h5>
    <div class="table-responsive">
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
        </tbody>
      </table>
    </div>

    <h5>Research</h5>
    <div class="table-responsive">
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
        </tbody>
      </table>
    </div>

    <h5>Trade</h5>
    <div class="table-responsive">
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
            <td>Technology Sent</td>
            <td class="text-right">{{ user.achievements.trade.technologySent }}</td>
          </tr>
          <tr>
            <td>Technology Received</td>
            <td class="text-right">{{ user.achievements.trade.technologyReceived }}</td>
          </tr>
          <tr>
            <td>Renown Sent</td>
            <td class="text-right">{{ user.achievements.trade.renownSent }}</td>
          </tr>
        </tbody>
      </table>
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
          <h1><i class="fas fa-question"></i></h1>
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
import userService from '../services/api/user'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'achievements': Achievements
  },
  data () {
    return {
      user: null,
      achievements: null
    }
  },
  async mounted () {
    try {
      let response = await userService.getUserAchievements(this.$route.params.userId)

      this.user = response.data
    } catch (err) {
      console.error(err)
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
