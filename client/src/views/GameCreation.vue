<template>
  <div class="container">
    <view-title title="Create Game" />

    <form>
      <h4>Game Settings</h4>

      <div class="form-group row">
        <label for="name" class="col-sm-2 col-form-label">Name</label>
        <div class="col-sm-10">
          <input type="text" class="form-control" id="name" v-model="name">
        </div>
      </div>

      <div class="form-group row">
        <label for="description" class="col-sm-2 col-form-label">Description</label>
        <div class="col-sm-10">
          <textarea rows="4" class="form-control" id="description" v-model="description"></textarea>
        </div>
      </div>

      <div class="form-group row">
        <label for="password" class="col-sm-2 col-form-label">Password</label>
        <div class="col-sm-10">
          <input type="password" class="form-control" id="password" v-model="password">
        </div>
      </div>

      <div class="form-group row">
        <label for="starsForVictory" class="col-sm-2 col-form-label">Stars For Victory</label>
        <div class="col-sm-10">
          <select class="form-control" id="starsForVictory" v-model="starsForVictory">
            <option v-for="opt in starsForVictoryOptions" v-bind:key="opt" v-bind:value="opt">
              {{ opt }}% of all Stars
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="players" class="col-sm-2 col-form-label">Players</label>
        <div class="col-sm-10">
          <select class="form-control" id="players" v-model="players">
            <option v-for="opt in playersOptions" v-bind:key="opt" v-bind:value="opt">
              {{ opt }} Players
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="playerType" class="col-sm-2 col-form-label">Player Type</label>
        <div class="col-sm-10">
          <select class="form-control" id="playerType" v-model="playerType">
            <option v-for="opt in playerTypeOptions" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="formalAlliances" class="col-sm-2 col-form-label">Formal Alliances</label>
        <div class="col-sm-10">
          <select class="form-control" id="formalAlliances" v-model="formalAlliances">
            <option v-for="opt in formalAlliancesOptions" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="anonymity" class="col-sm-2 col-form-label">Anonymity</label>
        <div class="col-sm-10">
          <select class="form-control" id="anonymity" v-model="anonymity">
            <option v-for="opt in anonymityOptions" v-bind:key="opt.value" v-bind:value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
      </div>

    </form>
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
      name: null,
      description: null,
      password: null,
      starsForVictory: 50,
      starsForVictoryOptions: [25, 33, 50, 66],
      players: 8,
      playersOptions: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
      playerType: 0,
      playerTypeOptions: [
        { value: 0, text: 'All Players' },
        { value: 1, text: 'Premium Players Only' }
      ],
      formalAlliances: 0,
      formalAlliancesOptions: [
        { value: 0, text: 'No Formal Alliances' },
        { value: 1, text: 'Formal Alliances Enabled' }
      ],
      anonymity: 0,
      anonymityOptions: [
        { value: 0, text: 'Normal' },
        { value: 1, text: 'Extra' }
      ]
    };
  }
};
</script>

<style scoped>
</style>
