<template>
  <view-container>
    <view-title title="Codex" />

    <view-subtitle title="Table of Contents"/>

    <ul>
      <li><a @click="scrollTo('introduction')" href="javascript:void;">Introduction</a></li>
      <li><a @click="scrollTo('diplomacy')" href="javascript:void;">Diplomacy</a></li>
      <li><a @click="scrollTo('galaxy')" href="javascript:void;">Galaxy</a></li>
      <li><a @click="scrollTo('stars')" href="javascript:void;">Stars</a></li>
      <li><a @click="scrollTo('carriers')" href="javascript:void;">Carriers</a></li>
      <li><a @click="scrollTo('combat')" href="javascript:void;">Combat</a></li>
      <li><a @click="scrollTo('scienceTechnology')" href="javascript:void;">Science &amp; Technology</a></li>
      <li><a @click="scrollTo('trade')" href="javascript:void;">Trade</a></li>
      <li><a @click="scrollTo('specialists')" href="javascript:void;">Specialists</a></li>
      <li><a @click="scrollTo('turnBasedGames')" href="javascript:void;">Turn Based Games</a></li>
      <li><a @click="scrollTo('achievements')" href="javascript:void;">Achievements</a></li>
      <li><a @click="scrollTo('keyboardShortcuts')" href="javascript:void;">Keyboard Shortcuts</a></li>
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

      <p></p>
    </div>

    <div ref="carriers">
      <view-subtitle title="Carriers"/>

      <p></p>
    </div>

    <div ref="combat">
      <view-subtitle title="Combat"/>

      <p></p>
    </div>

    <div ref="scienceTechnology">
      <view-subtitle title="Science &amp; Technology"/>

      <p></p>
    </div>

    <div ref="turnBasedGames">
      <view-subtitle title="Turn Based Games"/>

      <p></p>
    </div>

    <div ref="achievements">
      <view-subtitle title="Achievements"/>

      <p></p>
    </div>

    <div ref="keyboardShortcuts">
      <view-subtitle title="Keyboard Shortcuts"/>

      <p></p>
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
</style>
