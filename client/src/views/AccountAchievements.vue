<template>
  <div class="container bg-light">
    <view-title title="Achievements" />

    <achievements v-bind:victories="achievements.victories" v-bind:rank="achievements.rank" v-bind:renown="achievements.renown"/>

    <p class="text-center pt-3">Read more about <a href="">Victory, Rank and Renown</a>.</p>

    <view-subtitle title="Badges"/>

    <p class="text-center">In the game you are rewarded for being a tough opponent or great ally. When others enjoying playing against you they will buy you a badge.</p>

    <div class="row container">
      <div class="">
        <h1><i class="fas fa-flag"></i></h1>
      </div>
      <div class="col">
        <h5>Conqueror: <span class="text-success">{{ achievements.badges.conqueror }}</span></h5>
        <p>The badge is awarded to winners of the 32 Player Ultra Games. Players holding this badge have proven skill in both combat and diplomacy.</p>
      </div>
    </div>

    <div class="row container">
      <div class="">
        <h1><i class="fas fa-skull-crossbones"></i></h1>
      </div>
      <div class="col">
        <h5>Cutthroat Pirate: <span class="text-success">{{ achievements.badges.cutthroatPirate }}</span></h5>
        <p>In this treacherous universe, it's a fine line between good and evil. This badge is for the players who tread this line with grace and mastery.</p>
      </div>
    </div>

    <div class="row container">
      <div class="">
        <h1><i class="fas fa-skull"></i></h1>
      </div>
      <div class="col">
        <h5>Dead Set Badass: <span class="text-success">{{ achievements.badges.deadSetBadass }}</span></h5>
        <p>For the toughest opponents. Let other players be warned, this player shows a level of commitment that goes above and beyond.</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-chess-king"></i></h1>
      </div>
      <div class="col">
        <h5>Master Strategist: <span class="text-success">{{ achievements.badges.masterStrategist }}</span></h5>
        <p>For players who had a plan and executed it with aplomb. Be they allies or enemies, some players deserve a little recognition for their achievements. </p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-pen-fancy"></i></h1>
      </div>
      <div class="col">
        <h5>Wordsmith: <span class="text-success">{{ achievements.badges.wordsmith }}</span></h5>
        <p>For the players who breathe life and flavor into the game with their commitment to roleplaying. Good show chaps!</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-paw"></i></h1>
      </div>
      <div class="col">
        <h5>Lionheart: <span class="text-success">{{ achievements.badges.lionheart }}</span></h5>
        <p>For players who show great courage in the face of adversity, holding on against all odds to support the alliance in victory! </p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-dice"></i></h1>
      </div>
      <div class="col">
        <h5>Lucky Devil: <span class="text-success">{{ achievements.badges.luckyDevil }}</span></h5>
        <p>Great tactics, awesome strategy, or just one lucky son-of-a-gun. For the player whose stars were aligned. They won't be so lucky next time!</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-pizza-slice"></i></h1>
      </div>
      <div class="col">
        <h5>Slice of Cheese: <span class="text-success">{{ achievements.badges.sliceOfCheese }}</span></h5>
        <p>Had a great game but can't decide which badge is right? Buy a slice of cheese. Who doesn't like pizza?</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-fish"></i></h1>
      </div>
      <div class="col">
        <h5>Ironborn: <span class="text-success">{{ achievements.badges.ironborn }}</span></h5>
        <p>Hard places breed hard men, and hard men rule the world. Award this badge to the Ironborn of the universe.</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-fighter-jet"></i></h1>
      </div>
      <div class="col">
        <h5>Quick Draw: <span class="text-success">{{ achievements.badges.quickDraw }}</span></h5>
        <p>For the player who shoots first and asks questions later. Whether they deliver a hammer blow or are massacred, such a bold move deserves some recognition.</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-satellite"></i></h1>
      </div>
      <div class="col">
        <h5>Sentinel: <span class="text-success">{{ achievements.badges.sentinel }}</span></h5>
        <p>Some players are always watching, just waiting for you to make that one crucial mistake. Why not buy that player who never seems to sleep the sentinel badge?</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-atom"></i></h1>
      </div>
      <div class="col">
        <h5>Mad Scientist: <span class="text-success">{{ achievements.badges.madScientist }}</span></h5>
        <p>For those who love the feel of a lab coat against the skin. Reward those who claim galactic dominance by pushing their research teams to the limit!</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-question"></i></h1>
      </div>
      <div class="col">
        <h5>Strange One: <span class="text-success">{{ achievements.badges.strangeOne }}</span></h5>
        <p>We all seek to anticipate our opponents’ moves, but sometimes their actions defy all predictions. Why not buy them this badge to show them how confused you are by their judgements.</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-biohazard"></i></h1>
      </div>
      <div class="col">
        <h5>Toxic: <span class="text-success">{{ achievements.badges.toxic }}</span></h5>
        <p>Some players just make your blood boil. Vent your spleen and label them toxic.</p>
      </div>
    </div>
    
    <div class="row container">
      <div class="">
        <h1><i class="fas fa-user-friends"></i></h1>
      </div>
      <div class="col">
        <h5>Top Ally: <span class="text-success">{{ achievements.badges.topAlly }}</span></h5>
        <p>For no other reason than that you enjoyed your game with this player.</p>
      </div>
    </div>
  </div>
</template>

<script>
import ViewTitle from '../components/ViewTitle';
import ViewSubtitle from '../components/ViewSubtitle';
import Achievements from '../components/game/player/Achievements';
import apiService from '../services/apiService';

export default {
  components: {
    'view-title': ViewTitle,
    'view-subtitle': ViewSubtitle,
    'achievements': Achievements
  },
  data() {
    return {
      achievements: null
    };
  },
  async mounted() {
    try {
      let response = await apiService.getMyUserInfo();

      this.achievements = response.data.achievements;
    } catch(err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
.fa-trophy {
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
}
</style>
