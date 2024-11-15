<template>
  <div class="modal fade" id="colourOverride" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="player">
        <div class="modal-header">
          <h5 class="modal-title" id="modalLabel">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="colour-override-controls form-group">
            <label for="colour">Colour</label>
            <select v-model="currentColour">
              <option v-for="colour in $store.state.coloursConfig" :value="colour.alias">{{ colour.alias }}</option>
            </select>
            <span class="override-current-colour" :style="{ 'background-color': toColourValue(currentColour) }" />
            <button class="btn btn-default btn-sm" v-on:click="setToDefault">Use default</button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="onCancel" type="button" class="btn btn-outline-danger ps-3 pe-3" data-bs-dismiss="modal">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button @click="onConfirm" type="button" class="btn btn-success ps-3 pe-3" data-bs-dismiss="modal">
            <i class="fas fa-check"></i> Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gameHelper from "../../../../services/gameHelper";

export default {
  name: "ColourOverrideDialog.vue",
  props: {
    playerId: String,
  },
  data () {
    return {
      currentColour: null,
      player: null,
      modal: null,
    }
  },
  mounted () {
    const modalEl = document.getElementById("colourOverride");

    modalEl.addEventListener('hidden.bs.modal', () => {
      this.$emit('onColourOverrideCancelled');
    });

    this.modal = new bootstrap.Modal(modalEl);
    this.modal.show();
    this.player = gameHelper.getPlayerById(this.$store.state.game, this.playerId);
    this.currentColour = this.ensureExists(this.$store.getters.getColourForPlayer(this.playerId).alias);
  },
  methods: {
    ensureExists (alias) {
      const existsA = this.$store.state.coloursConfig.find(colour => colour.alias === alias);

      if (existsA) {
        return alias;
      }

      const existsV = this.$store.state.coloursConfig.find(colour => colour.value === gameHelper.getFriendlyColour(this.player.colour.value))?.alias;

      if (existsV) {
        return existsV;
      }

      return this.$store.state.coloursConfig[0].alias;
    },
    onCancel () {
      this.$emit('onColourOverrideCancelled');
    },
    async onConfirm () {
      try {
        await this.$store.dispatch('addColourMapping', {
          playerId: this.player._id,
          colour: {
            alias: this.currentColour,
            value: this.toColourValue(this.currentColour)
          }
        });

        this.$emit('onColourOverrideConfirmed');
      } catch (e) {
        console.error(e);
        this.$toast.error(`There was a problem saving the custom colour`)
      }
    },
    toColourValue (alias) {
      return this.$store.state.coloursConfig.find(colour => colour.alias === alias)?.value
    },
    setToDefault () {
      this.currentColour = this.ensureExists(this.player.colour.alias);
    }
  },
  computed: {
    title () {
      return `Custom colour for ${this.player.alias}`
    }
  }
}
</script>

<style scoped>
.colour-override-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.override-current-colour {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>
