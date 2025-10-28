<template>
    <div class="menu-page container">
        <menu-title title="Combat Calculator" @onCloseRequested="onCloseRequested"/>

        <div class="row">
            <div class="col-12">
                <form-error-list v-bind:errors="errors"/>
            </div>
            <form class="col-12" @submit="calculate">
                <div class="mb-2 row">
                    <label for="defenderWeaponTech" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-gun':!defender.player,'fa-user':defender.player}"></i>
                      <span class="text-success ms-2">{{defender.player ? defender.player.alias : 'Defender'}}</span> Weapons
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderWeaponTech" placeholder="Tech Level" v-model="defender.weaponsLevel" :required="true">
                    </div>
                </div>
                <div class="mb-2 row">
                    <label for="defenderShips" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-rocket':!defender.star,'fa-star':defender.star}"></i>
                      <span class="text-success ms-2">{{defender.star ? defender.star.name : 'Defender'}}</span> Ships
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="defenderShips" placeholder="Ships" v-model="defender.ships" :required="true">
                    </div>
                </div>
                <div class="mb-2 row">
                  <div class="col-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="isTurnBased" id="chkIsTurnBased">
                      <label class="form-check-label" for="chkIsTurnBased">
                        Carrier-to-Star Combat
                      </label>
                    </div>
                  </div>
                </div>
                <div class="mb-2 row" v-if="hasDefenderBonus">
                  <div class="col-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="includeDefenderBonus" id="chkDefenderBonus">
                      <label class="form-check-label" for="chkDefenderBonus">
                        Defender Bonus
                      </label>
                    </div>
                  </div>

                  <label class="col-4 col-form-label text-end text-success pt-0 pb-0" v-if="includeDefenderBonus">+1 Weapons</label>
                </div>

                <hr/>

                <div class="mb-2 row">
                    <label for="attackerWeaponTech" class="col-8 col-form-label">
                      <i class="fas" :class="{'fa-gun':!attacker.player,'fa-user':attacker.player}"></i>
                      <span class="text-danger ms-2">{{attacker.player ? attacker.player.alias : 'Attacker'}}</span> Weapons
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerWeaponTech" placeholder="Tech Level" v-model="attacker.weaponsLevel" :required="true">
                    </div>
                </div>
                <div class="mb-2 row">
                    <label for="attackerShips" class="col-8 col-form-label">
                      <i class="fas fa-rocket"></i>
                      <span class="text-danger ms-2">{{attacker.carrier ? attacker.carrier.name : 'Attacker'}}</span> Ships
                    </label>
                    <div class="col-4">
                        <input type="number" class="form-control" id="attackerShips" placeholder="Ships" v-model="attacker.ships" :required="true">
                    </div>
                </div>

                <div class="mb-2 row">
                  <div class="col-auto col-sm-8">
                    <button type="button" class="btn btn-outline-info" :disabled="isLoading" title="Swap the defender/attacker values" @click="swapValues"><i class="fas fa-exchange-alt"></i> Swap Values</button>
                  </div>
                  <div class="col col-sm-4">
                    <div class="d-grid gap-2">
                      <button type="submit" class="btn btn-success" :disabled="isLoading || isInvalid" title="Calculate the combat result"><i class="fas fa-fist-raised"></i> Fight</button>
                    </div>
                  </div>
                </div>
            </form>
        </div>

        <loading-spinner :loading="isLoading"/>

        <div class="row bg-dark pt-2 pb-2" v-if="result">
          <p class="col text-center mb-0" v-if="result.after.defender >= result.after.attacker"><span class="text-success">Defender</span> wins with <span class="text-success">{{result.after.defender}}</span> ship(s) remaining.</p>
          <p class="col text-center mb-0" v-if="result.after.attacker > result.after.defender"><span class="text-danger">Attacker</span> wins with <span class="text-danger">{{result.after.attacker}}</span> ship(s) remaining.</p>
        </div>
        <div class="row bg-dark pb-2" v-if="result?.needed">
          <p class="col text-center mb-0" v-if="result.needed.defender"><small><span class="text-success">Defender</span> would need <span class="text-success">{{result.needed.defender}}</span> ship(s) to win.</small></p>
          <p class="col text-center mb-0" v-if="result.needed.attacker"><small><span class="text-danger">Attacker</span> would need <span class="text-danger">{{result.needed.attacker}}</span> ship(s) to win.</small></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import MenuTitle from '../MenuTitle.vue';
import FormErrorList from '../../../components/FormErrorList.vue';
import GameHelper from '../../../../services/gameHelper';
import {inject} from 'vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import type {Carrier, Game, Player, Star} from "@/types/game";
import type {CombatResultShips} from "@solaris-common";
import {calculateCombat} from "@/services/typedapi/carrier";
import {onMounted, ref, computed} from 'vue';
import {useStore} from 'vuex';

type CombatSide = {
  ships: number,
  weaponsLevel: number,
  player: Player | null,
  star: Star | null,
  carrier: Carrier | null,
}

const props = defineProps<{
  carrierId?: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
}>();

const store = useStore();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const isLoading = ref(false);
const errors = ref<string[]>([]);
const isTurnBased = ref(true);
const result = ref<CombatResultShips | null>(null);

const game = computed<Game>(() => store.state.game);
const hasDefenderBonus = computed(() => game.value.settings.specialGalaxy.defenderBonus === 'enabled');

const includeDefenderBonus = ref(hasDefenderBonus.value);

const isInvalid = computed(() => {
  return defender.value.weaponsLevel <= 0 ||
         attacker.value.weaponsLevel <= 0 ||
         attacker.value.ships <= 0;
});

const defender = ref<CombatSide>({
  ships: 0,
  weaponsLevel: 1,
  player: null,
  star: null,
  carrier: null,
});

const attacker = ref<CombatSide>({
  ships: 0,
  weaponsLevel: 1,
  player: null,
  star: null,
  carrier: null,
});

const swapValues = () => {
  let dS = defender.value.ships,
      dW = defender.value.weaponsLevel,
      aS = attacker.value.ships,
      aW = attacker.value.weaponsLevel

  defender.value.ships = aS
  defender.value.weaponsLevel = aW
  attacker.value.ships = dS
  attacker.value.weaponsLevel = dW
};

const onCloseRequested = (e: Event) => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllStars);
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllCarriers);

  emit('onCloseRequested', e);
};

const tryAutoCalculate = () => {
  if (props.carrierId) {
    // Work out where the carrier is travelling to and add the ships and weapons level
    // of the destination star.
    const attackerCarrier = GameHelper.getCarrierById(game.value, props.carrierId);
    const attackerPlayer = attackerCarrier && GameHelper.getCarrierOwningPlayer(game.value, attackerCarrier);

    if (!attackerCarrier || !attackerPlayer) {
      return;
    }

    attacker.value.carrier = attackerCarrier;
    attacker.value.player = attackerPlayer;

    if (attacker.value.carrier?.waypoints && attacker.value.carrier?.waypoints.length) {
      const defenderStar = GameHelper.getStarById(game.value, attacker.value.carrier.waypoints[0].destination);

      if (!defenderStar) {
        return;
      }

      defender.value.star = defenderStar;

      attacker.value.ships = attackerCarrier.ships || 0;
      attacker.value.weaponsLevel = attackerPlayer.research.weapons.level;

      if (defenderStar) { // May be out of scanning range.
        const defenderPlayer = GameHelper.getStarOwningPlayer(game.value, defenderStar);
        const defenderShips = GameHelper.getStarTotalKnownShips(game.value, defenderStar);

        if (defenderShips === null || !defenderPlayer) {
          return;
        }

        defender.value.player = defenderPlayer;
        defender.value.ships = defenderShips;

        defender.value.weaponsLevel = defender.value.player.research.weapons.level;
      }
    }
  }
};

const calculate = async (e: Event) => {
  errors.value = [];

  if (defender.value.weaponsLevel <= 0) {
    errors.value.push('Defender weapons level must be greater than 0.');
  }

  if (defender.value.ships < 0) {
    errors.value.push('Defender ships must be greater than or equal to 0.');
  }

  if (attacker.value.weaponsLevel <= 0) {
    errors.value.push('Attacker weapons level must be greater than 0.');
  }

  if (attacker.value.ships < 0) {
    errors.value.push('Attacker ships must be greater than or equal to 0.');
  }

  if (e) {
    e.preventDefault();
  }

  if (errors.value.length) {
    return;
  }

  isLoading.value = true;

  const defenderWeapons = defender.value.weaponsLevel + (includeDefenderBonus.value ? 1 : 0);

  const response = await calculateCombat(httpClient)(game.value._id, { ships: defender.value.ships, weaponsLevel: defenderWeapons }, { ships: attacker.value.ships, weaponsLevel: attacker.value.weaponsLevel }, isTurnBased.value);

  if (isOk(response)) {
    result.value = response.data;
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isLoading.value = false;
}

onMounted(async () => {
  if (props.carrierId) {
    await tryAutoCalculate();
  }
});
</script>

<style scoped>
.form-check-input, .form-check-label {
  cursor: pointer;
}
</style>
