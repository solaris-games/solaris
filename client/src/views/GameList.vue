<template>
  <div class="container bg-light">
    <view-title title="Game List" />

    <div v-for="game in serverGames" v-bind:key="game._id">
        <h4>{{game.name}}</h4>
        <img :src="getServerGameImage(game)">
        <p>{{game.playerCount}} of {{game.maxPlayers}} Players</p>
         
        <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">Read More</router-link>
    </div>

    <hr>

    <h3>User Created Games</h3>
    
    <table>
        <thead>
            <tr>
                <td>Name</td>
                <td>Players</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="game in userGames" v-bind:key="game._id">
                <td>{{game.name}}</td>
                <td>{{game.playerCount}} of {{game.maxPlayers}}</td>
                <td>
                    <router-link :to="{ path: '/game/detail', query: { id: game._id } }" tag="button" class="btn btn-primary">Read More</router-link>
                </td>
            </tr>
        </tbody>
    </table>
  </div>
</template>

<script>
import ViewTitle from "../components/ViewTitle";

export default {
  components: {
    "view-title": ViewTitle
  },
  data() {
      return {
          serverGames: [
              {
                  _id: 1,
                  name: 'New Player Game',
                  playerCount: 1,
                  maxPlayers: 8
              }
          ],
          userGames: [
              {
                  _id: 2,
                  name: 'Mr Test\'s Game',
                  playerCount: 1,
                  maxPlayers: 8
              }
          ]
      };
  },
  methods: {
      getServerGameImage(game) {
          return require('../assets/cards/' + game.name.replace(/\s/g, '') + '.jpg');
      }
  }
};
</script>

<style scoped>
</style>
