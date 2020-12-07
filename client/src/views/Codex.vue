<template>
  <view-container>
    <view-title title="Codex" />

    <view-subtitle title="Table of Contents"/>

    <ul>
      <li><a @click="scrollTo('introduction')" href="javascript:;">Introduction</a></li>
      <li><a @click="scrollTo('diplomacy')" href="javascript:;">Diplomacy</a></li>
      <li><a @click="scrollTo('galaxy')" href="javascript:;">Galaxy</a></li>
      <li><a @click="scrollTo('stars')" href="javascript:;">Stars</a></li>
      <li><a @click="scrollTo('infrastructure')" href="javascript:;">Infrastructure</a></li>
      <li><a @click="scrollTo('carriers')" href="javascript:;">Carriers</a></li>
      <li><a @click="scrollTo('combat')" href="javascript:;">Combat</a></li>
      <li><a @click="scrollTo('scienceTechnology')" href="javascript:;">Science &amp; Technology</a></li>
      <li><a @click="scrollTo('trade')" href="javascript:;">Trade</a></li>
      <li><a @click="scrollTo('specialists')" href="javascript:;">Specialists</a></li>
      <li><a @click="scrollTo('turnBasedGames')" href="javascript:;">Turn Based Games</a></li>
      <li><a @click="scrollTo('achievements')" href="javascript:;">Achievements</a></li>
      <!-- <li><a @click="scrollTo('keyboardShortcuts')" href="javascript:;">Keyboard Shortcuts</a></li> -->
    </ul>

    <div ref="introduction">
      <view-subtitle title="Introduction"/>

      <p>
        Solaris is a slow paced browser game based on diplomacy, strategy and intrigue. To win the game, you must
        capture stars.
      </p>

      <p>
        You will not be alone, other players will also be trying to achieve the same goal. You must build diplomatic
        relations with other players to create alliances, trade agreements and possibly even subterfuge to backstab your allies and claim victory.
      </p>

      <p>
        The galaxy contains stars that can be upgraded and will build ships for carriers that will traverse across the galaxy
        in order to capture unclaimed stars or fight other players to capture theirs.
      </p>
    </div>

    <div ref="diplomacy">
      <view-subtitle title="Diplomacy"/>

      <p>
        Diplomacy plays a huge role in Solaris, the key to victory is not only galactic conquest, but also building relations
        with allies. You may first want to establish an alliance early on in the game to gain an advantage.
      </p>

      <p>
        You should build trade agreements with other players, there will almost certainly be other players and alliances who will
        have trade agreements and it is important to keep up with these players' technology levels otherwise you will be at a disadvantage.
      </p>

      <p>
        It may prove to be useful to become the sole player who has a large technology lead of a single technology. For example if you have
        the highest Weapons technology then other players will want to trade with you and may want to stay friendly with you.
      </p>

      <p>
        Be aware that other players may be plotting to destroy your empire, especially if you have a lead or are relatively weak. Remember
        to keep communications open and your borders protected from unwanted aggression.
      </p>
    </div>

    <div ref="galaxy">
      <view-subtitle title="Galaxy"/>

      <p>
        The galaxy map will display the following:
      </p>

      <ul>
        <li>Stars</li>
        <li>Carriers</li>
        <li>Warp Gates</li>
        <li>Specialists</li>
      </ul>

      <h5>Stars</h5>
      <p>
        Stars are displayed as star shaped icons with a circular halo denoating which player the star belongs to by colour.
        When zoomed in the star will display garrison and how many carriers are orbiting the star (if any) followed by the star's name.
        Above the star there will be 3 numbers, these represent the star's Economy, Industry and Science infrastructure respectively.
        Click on the star to view it in detail.
      </p>

      <p>If star has a warp gate then it will be displayed with an additional halo.</p>

      <p>
        When you select a star its Hyperspace Range and Scanning Range will become visible. Hyperspace Range is displayed as a
        circular spikey ring around the star and the Scanning Range is displayed as a solid circle around the star.
      </p>

      <h5>Carriers</h5>
      <p>
        Carriers are displayed as small ship icons with a circular coloured halo, much like stars. The number of ships that a carrier
        has will be displayed when zoomed in. Click on the carrier to view it in detail.
      </p>

      <p>
        Carriers that have waypoints will have a line drawn to their destination. If those waypoints are looped then the line will be
        slightly thinner.
      </p>

      <h5>Specialists</h5>
      <p>
        If a star or carrier has a specialist, the specialist icon will be displayed instead of the standard star/carrier icon. To view
        the specialist in detail, click on the star/carrier and scroll to the "Specialist" section.
      </p>
    </div>

    <div ref="stars">
      <view-subtitle title="Stars"/>

      <p>
        Stars on the map display the following details:
      </p>
      
      <ul>
        <li>The star name.</li>
        <li>The star's total garrison.</li>
        <li>The star's infrastructure. (Economy, Industry, Science)</li>
        <li>Whether the star has a warp gate.</li>
      </ul>

      <p>
        Click on a star to view the star detail, this screen displays all information related to a star.
        For example who owns the star, how many resources it has, its infrastructure and what carriers are in orbit.
      </p>

      <p>
        A star's natural resources determines how many credits it will cost to build infrastructure. The higher
        the natural resources, the cheaper it costs to upgrade. Stars with natural resources tend to be highly
        saught after.
      </p>

      <p>
        The Terraforming technology improves the star's natural resources and makes building infrastructure
        cheaper.
      </p>

      <ul>
        <li>Upgrade star infrastructure improve the star's cash yield, increase ship production and speed up research.</li>
        <li>Build a Carrier to transport ships through hyperspace.</li>
        <li>Build a Warp Gate to accelerate carrier movement.</li>
        <li>Upgrade the Star by hiring a Specialist which grants special abilities.</li>
      </ul>

      <p>
        <strong>Warp Gates</strong> will improve the speed of which Carriers will travel between stars in hyperspace.
        A warp gate must be built at the source star <strong>and</strong> the destination star in order for a Carrier
        to receive the speed boost.
      </p>

      <p>
        You may choose to <strong>abandon a star</strong>, in which case all Carriers and Ships at the star will be destroyed
        and all infrastructure will remain intact, including a warp gate if present. The warp gate will be inactive so it will
        not grant a speed boost to incoming Carriers.
      </p>
    </div>

    <div ref="infrastructure">
      <view-subtitle title="Infrastructure"/>

      <p>
        There are 3 types of infrastructure that can be built at stars:
      </p>

      <ul>
        <li><strong>Economy</strong> - Increases income at production, each point of Economy earns 10 credits on the production tick.</li>
        <li><strong>Industry</strong> - Increases ship production rate.</li>
        <li><strong>Science</strong> - Increases research speed. Each point of Science will generate one research point per tick for the chosen current technology that is being researched.</li>
      </ul>
    </div>

    <div ref="carriers">
      <view-subtitle title="Carriers"/>

      <p>
        Carriers are used to transport Ships through hyperspace to reach other Stars. They can only be built
        at Stars and must hold a minimum of 1 Ship.
      </p>

      <ul>
        <li>Build a Carrier at a star.</li>
        <li>Plot the waypoints that the Carrier will follow.</li>
        <li>Transfer Ships between Carriers and Stars.</li>
        <li>Capture neutral or enemy Stars by sending a Carrier to one.</li>
        <li>Send a Carrier to intercept an incoming enemy Carrier.</li>
        <li>Upgrade Carriers with Specialists to grant special abilities.</li>
      </ul>

      <p>
        By default a Carrier will transfer <strong>all</strong> garrisoned Ships at the Star it was built at,
        this can be configured in the menu settings.
      </p>

      <p>
        By default, Carrier waypoints will <strong>Collect All</strong> Ships when landing at a destination,
        this can be configured in the menu settings.
      </p>
    </div>

    <div ref="combat">
      <view-subtitle title="Combat"/>

      <p>
        Combat occurs when a Carrier arrives at an enemy Star or when a Carrier intercepts an enemy Carrier in hyperspace.
        The combat summary can be viewed in the event log.
      </p>

      <p>
        When 2 opposing Carriers arrive at a Star on the same tick, the Carrier that travelled the <strong>least</strong>
        distance in the current tick will arrive at the Star first and receive the Defender Bonus (if enabled).
      </p>

      <p>
        Starting with the defender, each player takes it in turns to deal damage to the opposing player. Damage dealt
        per turn is equal to the effective weapons level, factoring in weapons technology and specialist abilities. Damage
        is dealt roughly equally to all Carriers and the Star per turn.
      </p>

      <p>
        If multiple opposing Players are in combat at the same time, they will be split into Attackers and Defenders. Where the
        defender is the player who owns the star and the attackers are <strong>all other players</strong>. Combat is repeated
        until there is one player remaining.
      </p>

      <p>
        When a Star is captured, all of its <strong>Economy</strong> is destroyed and the winner is awarded 10 credits
        per point of Economy. Industry, Science, Warp Gates and Star Specialists are undamaged and are captured by the winning player.
      </p>
    </div>

    <div ref="scienceTechnology">
      <view-subtitle title="Science &amp; Technology"/>

      <p>
        Science infrastructure built at Stars contribute to the overall research amount per tick for the chosen technology that is being researched.
        More Science infrastructure increases the speed of which new technology is researched.
      </p>

      <p>
        Open the <strong>Research</strong> screen to view the current research and set the next research. The types
        of technologies are as follows:
      </p>

      <ul>
        <li><strong>Scanning</strong> - Improves the visibile range a star can see.</li>
        <li><strong>Hyperspace Range</strong> - Improves the distance a Carrier can travel in a single jump.</li>
        <li><strong>Terraforming</strong> - Improves the natural resources at Stars to make infrastructure upgrades cheaper.</li>
        <li><strong>Experimentation</strong> - Grants a bonus research amount per production tick to a random technology.</li>
        <li><strong>Weapons</strong> - Improves the amount of damage dealt in combat.</li>
        <li><strong>Banking</strong> - Earns additional credits on production tick.</li>
        <li><strong>Manufacturing</strong> - Increases ship production rate on all industry.</li>
      </ul>
    </div>

    <div ref="turnBasedGames">
      <view-subtitle title="Turn Based Games"/>

      <p>
        Turn based games play differently to real time games. The game does not run in real time, however runs in
        tick intervals.
      </p>

      <p>
        When all players are ready, a given number of ticks (based on game settings) will run all at once. This means
        that games can be played much much faster than real time games or give players who do not have much time
        the chance to play at their leisure.
      </p>

      <p>
        Like in real time games, turn based games have an auto-resign function. If a player misses 3 <strong>consecutive</strong>
        turns, that player will be automatically defeated.
      </p>
    </div>

    <div ref="achievements">
      <view-subtitle title="Achievements"/>

      <p>
        Your game statistics are tracked whilst playing Solaris and you can view a breakdown of your achievements
        on the Achievements page.
      </p>
    </div>

    <!-- <div ref="keyboardShortcuts">
      <view-subtitle title="Keyboard Shortcuts"/>

      <p></p>
    </div> -->
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import ViewSubTitle from '../components/ViewSubtitle'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'view-subtitle': ViewSubTitle
  },
  methods: {
    scrollTo (id) {
      var element = this.$refs[id];
      var top = element.offsetTop;

      window.scrollTo(0, top);
    }
  }
}
</script>

<style scoped>
</style>
