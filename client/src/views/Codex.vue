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
      <li><a @click="scrollTo('gameTickEvents')" href="javascript:;">Game Tick Events</a></li>
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

    <div ref="trade">
      <view-subtitle title="Trade"/>

      <p>
        Trade is an integral part of diplomacy. When you select a player in a game there will be an option to trade either technology or credits. 
        Trading technology with another player will cost a certain amount of credits based on the game's settings. 
        In a standard game the transfer cost of technology is $15 per tech level, so trading a level 2 technology would cost 
        $30 and a level 3 technology would cost $45.
      </p>

      <p>
        Alongside technology you can also send credits to another player. To send credits to a player simply input how much you want to give 
        to the player in the text box at the bottom. 
      </p>

      <p>
        To keep track of trade there is a ledger. It details how much a player owes. Players have the option to repay their debt or the 
        creditor can forgive all debt.
      </p>

      <p>
        Depending on game settings a player may have to be in scanning distance with another player in order to trade with them.
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

      <img :src="require('../assets/screenshots/codex/star1.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="A star displayed on the map"/>

      <p>If star has a warp gate then it will be displayed with an additional halo.</p>

      <img :src="require('../assets/screenshots/codex/star2.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="A star's scanning and hyperspace range"/>

      <h5>Carriers</h5>
      <p>
        Carriers are displayed as small ship icons with a circular coloured halo, much like stars. The number of ships that a carrier
        has will be displayed when zoomed in. Click on the carrier to view it in detail.
      </p>

      <img :src="require('../assets/screenshots/codex/carrier1.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="Carriers on the map"/>

      <p>
        Carriers that have waypoints will have a line drawn to their destination. If those waypoints are looped then the line will be
        slightly thinner.
      </p>

      <h5>Specialists</h5>
      <p>
        If a star or carrier has a specialist, the matching specialist icon will be displayed instead of the standard star/carrier icon. 
        To view the specialist in detail, click on the star/carrier and scroll to the "Specialist" section. Specialists can provide 
        any number of modifiers to a star or carrier's statistics, and are fundamental to a strategically successful game.
      </p>

      <h5>Galaxy Territories</h5>
      <p>
        If you zoom far out the territories held by players will be visible. This gives you a good indication of where empires are located, 
        and you will be able to identify strong areas and weak points that are cut off from the rest of a player's stars. 
        There are two different styles of territory appearance, which can be accessed from the in-game options menu.
      </p> 
      <img :src="require('../assets/screenshots/codex/map1.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="Galaxy territories"/>
    </div>

    <div ref="stars">
      <view-subtitle title="Stars"/>

      <p>
        Stars on the map display the following details:
      </p>
      
      <ul>
        <li>The star name.</li>
        <li>The star owning player denoted by its colour.</li>
        <li>The star's total garrison.</li>
        <li>The star's infrastructure. (Economy, Industry, Science)</li>
        <li>Whether the star has a warp gate.</li>
      </ul>

      <p>
        Click on a star to view the star statistics in detail. This screen displays all of the information related to the star. 
        In order displayed in the image, is the star name, a button for centering on the star, a button to close the menu, the 
        owner of the star, the star's natural/terraformed resources, the star's economy, industry, and science levels, how many ships 
        are stationed at the star, the specialist that is stationed at the star, and how many ships the star manufactures every tick. 
        Below that are the buttons to purchase more economy, industry, and science, as well as a button for creating a carrier at the 
        star and a button for purchasing a warpgate at the star.
      </p>

      <img :src="require('../assets/screenshots/codex/star3.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="The star detail screen (compact mode)"/>

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
        <strong>Warp Gates</strong> will improve the speed by times 3 of what Carriers typically travel between star. 
        A warp gate must be built at the departure star and the destination star in order for a Carrier to receive the speed 
        boost. The warp gate speed boost also multiplies by 3 even if the traveling carrier has a speed boost from a specialist. 
        Therefore, if the carrier has a times 2 speed boost from a specialist, then when that carrier is traveling between two warp 
        gates it will travel at times 6 speed.
      </p>

      <img :src="require('../assets/screenshots/codex/star4.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="A star with a warp gate"/>

      <p>
        You may choose to <strong>abandon a star</strong>, in which case all Carriers and Ships at the star will be destroyed and all infrastructure 
        will remain intact, including a warp gate if present. When abandoned the warp gate will become inactive until the star is 
        claimed again, so it will not grant a speed boost to incoming Carriers.
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

      <img :src="require('../assets/screenshots/codex/star5.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="Star upgrade infrastructure"/>

      <p>
        When you select a star its Hyperspace Range and Scanning Range will become visible. Hyperspace Range is displayed as a ridged ring centered 
        on the star and the Scanning Range is displayed as a solid circle around the star.
      </p>
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
        <li>Purchase a specialist on a carrier to grant special abilities.</li>
      </ul>

      <img :src="require('../assets/screenshots/codex/carrier2.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="The carrier detail screen (compact mode)"/>

      <p>
        Carriers are displayed as small ship icons with a coloured shape, matching its owner's stars. The number of ships 
        that a carrier has is displayed when you zoom in on it. Click on the carrier to view its statistics in detail.
      </p>

      <p>
        Carriers that have waypoints will have a line drawn to their destination. To set a carrier's waypoints, 
        (where it will travel to) click on the <strong>+</strong> symbol in the carrier's menu. You can then click on stars to add them 
        to the carrier's queue. A carrier can have any amount of scheduled waypoints. If those waypoints are looped then the 
        waypoint line will appear fainter. You can loop a carrier's waypoints at any point by clicking the "loop" button in the carrier's 
        menu. The carrier will then endlessly follow its waypoints, traveling from from the last waypoint of its que to the first 
        one when it reaches the end of its path. To loop a carrier, the two ends of its waypoint que must be within valid range of each other.
      </p>

      <p>
        By default a Carrier will transfer <strong>all</strong> garrisoned Ships at the Star it was built at,
        this can be configured in the menu settings.
      </p>

      <p>
        By default, Carrier waypoints will <strong>Collect All Ships</strong> when landing at a destination. To change that, 
        after setting a carrier's waypoints click save and edit to change what actions the carrier will 
        perform at its next waypoint.
      </p>

      <p>
        Carriers can also be gifted to other players. When a gifted carrier arrives at its destination the player who owns the star will gain control of the carrier and its ships. 
      </p>
    </div>

    <div ref="combat">
      <view-subtitle title="Combat"/>

      <p>
        Combat occurs when a Carrier arrives at an enemy Star or when a Carrier intercepts an enemy Carrier in hyperspace.
        The combat summary can be viewed in the event log.
      </p>

      <img :src="require('../assets/screenshots/codex/eventlog1.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="A combat event"/>

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

      <p>
        Combat can also occur between two carriers. When two carriers from different players intercept each other they will engage 
        in carrier to carrier combat. In carrier to carrier combat there is no defender bonus. 
      </p>
      
      <p>
        The combat calculator is a useful tool to predict the outcome of combat. Simply input the defender and attacker's 
        weapons level and number of ships and it will present the outcome.
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

      <img :src="require('../assets/screenshots/codex/research1.png')" class="img-thumbnail rounded mx-auto d-block img-sm mb-2" alt="The research screen"/>

      <ul>
        <li><strong>Scanning</strong> - Improves the visible area star a star can see. The higher your scanning, the further you can see.</li>
        <li><strong>Hyperspace Range</strong> - Improves the distance a carrier can travel in between each waypoint.</li>
        <li><strong>Terraforming</strong> - Improves the natural resources at Stars to make infrastructure upgrades cheaper.</li>
        <li><strong>Experimentation</strong> - Grants a 50 bonus points per level to a random technology each production.</li>
        <li><strong>Weapons</strong> - Improves the amount of enemy carriers each friendly carrier destroys in combat. Each carrier destroys enemy carriers exactly equal to the local weapons level.</li>
        <li><strong>Banking</strong> - Earns 75 extra credits every production. If experimental banking is enabled in game settings, you get additional extra credits based from your economy level.</li>
        <li><strong>Manufacturing</strong> - Increases ship production rate on all stars. The exact formula is a star produces <code>(X*(Y+5))/T</code> ships per tick, where X is the star's industry, Y is the star's manufacturing level, and T is the number of ticks in every production cycle.</li>
      </ul>
    </div>

    <div ref="turnBasedGames">
      <view-subtitle title="Turn Based Games"/>

      <p>
        Turn based games play differently to real time games. The game does not run in real time, however runs in
        tick intervals.
      </p>

      <p>
        When all players are ready, a given number of ticks (based on game settings) will happen all at once. 
        This means that games can be played much much faster than real time games 
        or allow players who do not have enough time to monitor real time games to play competitively. 
      </p>

      <p>
        Like in real time games, turn based games have an auto-resign function. If a player misses a number of 
        consecutive turns equal to the game’s settings, or doesn’t do anything on the first turn, 
        that player will be automatically resigned.
      </p>
    </div>

    <div ref="achievements">
      <view-subtitle title="Achievements"/>

      <p>
        Your game statistics are tracked whilst playing Solaris and you can view a breakdown of your achievements on the Achievements page. 
        You can also view other player’s achievements by selecting their name on the leaderboard.
      </p>
    </div>

    <!-- <div ref="keyboardShortcuts">
      <view-subtitle title="Keyboard Shortcuts"/>

      <p></p>
    </div> -->

    <div ref="gameTickEvents">
      <view-subtitle title="Game Tick Events"/>

      <p>
        The game runs in ticks, during a tick the following events happen in order:
      </p>

      <ul>
        <li>1. Carriers move and carrier-to-carrier combat is resolved.</li>
        <li>2. Carrier-to-star combat is resolved.</li>
        <li>3. Carrier drop actions are performed.</li>
        <li>4. Ships are built at stars.</li>
        <li>5. Carrier collect actions are performed.</li>
        <li>6. Carrier garrison actions are performed.</li>
        <li>7. Research is performed.</li>
        <li>8. If at the end of a galactic cycle:</li>
        <li>8a. Players receive credits from economy and banking.</li>
        <li>8b. Experimentations are performed.</li>
        <li>8c. Carrier upkeep is deducted.</li>
        <li>9. Game checks for afk and defeated players.</li>
        <li>10. Game checks for a winner.</li>
        <li>11. AI actions are performed.</li>
      </ul>
    </div>
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
img {
  height:auto;
}

.img-sm {
  max-width: 50%;
}

.img-md {
  max-width: 75%;
}

.img-lg {
  max-width: 100%;
}

@media(max-width: 576px) {
  .img-sm, .img-md, .img-lg {
    max-width: 100% !important;
  }
}
</style>
