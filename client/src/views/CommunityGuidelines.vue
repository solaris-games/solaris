<template>
  <view-container :hideTopBar="true">
    <view-title
      title="Community Guidelines"
      :showSocialLinks="false"
    />

    <ul>
      <li>Treat others online as you would treat them in real life</li>
      <li>Be tolerant towards other’s viewpoints; respectfully disagree when opinions do not align</li>
      <li>Respect the privacy and personal information of other members</li>
      <li>Communicate with courtesy and respect</li>
      <li>Assume good faith in communication</li>
    </ul>

    Do not:

    <ul>
      <li> Make personal attacks on other community members</li>
      <li> Use defamatory remarks, or make false statements or accusations against others</li>
      <li> Post prejudiced comments or profanity</li>
      <li> Bully or make inflammatory remarks to other community members</li>
      <li> Use alt accounts/multiboxing/map-hacks to cheat in games</li>
      <li> Use offensive characters when roleplaying</li>
    </ul>

    <p>If you see something that violates these guidelines, use the ingame report feature or contact the Project Lead or Community Managers (via Discord).</p>
    <p>We will take action when these guidelines are violated. Sometimes that just means giving someone a warning; other times it means revoking certain privileges or accounts entirely.</p>

    <p>And always keep in mind: Solaris is a game! Betrayal and subterfuge are a core part of the game. Don't make things personal, and treat your opponents with respect.</p>

    <p style="font-weight: bold">Agreement</p>

    <p>By logging onto the game and any official community channels, you are considered to be in agreement with the terms and conditions listed above.</p>
  </view-container>
</template>

<script>
import ViewContainer from "./components/ViewContainer.vue"
import ViewTitle from "./components/ViewTitle.vue"

export default {
  components: {
    "view-container": ViewContainer,
    "view-title": ViewTitle,
  }
}
</script>

<style scoped>

</style>
