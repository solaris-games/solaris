<template>
    <div>
        <p>
            Your forces have engaged the enemy in <span class="text-warning">carrier-to-star</span> combat at <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
        </p>
        <div class="table-responsive mt-2">
            <table class="table table-sm" v-if="event">
                <thead class="table-dark">
                    <th>Defender</th>
                    <th class="text-end">Before</th>
                    <th class="text-end">Lost</th>
                    <th class="text-end">After</th>
                </thead>
                <tbody>
                    <tr>
                        <td><i>Weapons {{event.data.combatResult.weapons.defender}} <span v-if="event.data.combatResult.weapons.defenderBase !== event.data.combatResult.weapons.defender">(base {{event.data.combatResult.weapons.defenderBase}})</span></i></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <i class="fas fa-star me-2"></i>
                            <span :style="{ 'color': getStarColour() }" class="name-and-icon">
                              <player-icon-shape :filled="true" :shape="getStarShape()" :iconColour="getStarColour()" />
                              {{event.data.starName}}
                            </span>
                            <span v-if="star.specialist" :title="star.specialist.description"> ({{star.specialist.name}})</span>
                        </td>
                        <td class="text-end">{{star.before}}</td>
                        <td class="text-end">{{star.lost}}</td>
                        <td class="text-end">{{star.after}}</td>
                    </tr>
                    <tr v-for="carrier of defenderCarriers" :key="carrier._id">
                        <td>
                            <i class="fas fa-rocket me-2"></i>
                            <span :style="{ 'color': getCarrierColour(carrier) }" class="name-and-icon">
                              <player-icon-shape :filled="true" :shape="getCarrierShape(carrier)" :iconColour="getCarrierColour(carrier)" />
                              {{carrier.name}}
                            </span>
                            <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                        </td>
                        <td class="text-end">{{carrier.before}}</td>
                        <td class="text-end">{{carrier.lost}}</td>
                        <td class="text-end">{{carrier.after}}</td>
                    </tr>
                    <tr>
                      <td><strong>Totals</strong></td>
                      <td class="text-end"><strong>{{totalDefenderBefore}}</strong></td>
                      <td class="text-end"><strong>{{totalDefenderLost}}</strong></td>
                      <td class="text-end"><strong>{{totalDefenderAfter}}</strong></td>
                    </tr>
                </tbody>
            </table>
            <table class="table table-sm" v-if="event">
                <thead class="table-dark">
                    <th>Attacker(s)</th>
                    <th class="text-end">Before</th>
                    <th class="text-end">Lost</th>
                    <th class="text-end">After</th>
                </thead>
                <tbody>
                  <tr>
                      <td><i>Weapons {{event.data.combatResult.weapons.attacker}} <span v-if="event.data.combatResult.weapons.attackerBase !== event.data.combatResult.weapons.attacker">(base {{event.data.combatResult.weapons.attackerBase}})</span></i></td>
                      <td></td>
                      <td></td>
                      <td></td>
                  </tr>
                  <tr v-for="carrier of attackerCarriers" :key="carrier._id">
                      <td>
                          <i class="fas fa-rocket me-2"></i>
                          <span :style="{ 'color': getCarrierColour(carrier) }" class="name-and-icon">
                            <player-icon-shape :filled="true" :iconColour="getCarrierColour(carrier)" :shape="getCarrierShape(carrier)" />
                            {{carrier.name}}
                          </span>
                          <span v-if="carrier.specialist" :title="carrier.specialist.description"> ({{carrier.specialist.name}})</span>
                      </td>
                      <td class="text-end">{{carrier.before}}</td>
                      <td class="text-end">{{carrier.lost}}</td>
                      <td class="text-end">{{carrier.after}}</td>
                  </tr>
                  <tr>
                    <td><strong>Totals</strong></td>
                    <td class="text-end"><strong>{{totalAttackerBefore}}</strong></td>
                    <td class="text-end"><strong>{{totalAttackerLost}}</strong></td>
                    <td class="text-end"><strong>{{totalAttackerAfter}}</strong></td>
                  </tr>
              </tbody>
          </table>
        </div>

        <hr class="mt-0"/>

        <div v-if="event.data.captureResult">
          <p>
            The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> has been captured
            by <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a>.
          </p>
          <p v-if="event.data.captureResult.captureReward">
            <a href="javascript:;" @click="emit('onOpenPlayerDetailRequested', event.data.captureResult.capturedById)">{{event.data.captureResult.capturedByAlias}}</a> is awarded
            <span class="text-warning">${{event.data.captureResult.captureReward}}</span> credits for destroying economic infrastructure.
          </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import GameHelper from '../../../../../services/gameHelper'
import PlayerIconShape from '../../player/PlayerIconShape.vue'
import StarLabel from '../../star/StarLabel.vue'
import type {CombatCarrier, PlayerCombatStarEvent} from "@solaris-common";
import { useStore } from 'vuex';
import type {Carrier, Game} from "../../../../../types/game";

const props = defineProps<{
  event: PlayerCombatStarEvent<string>
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string]
}>();

const store = useStore();

const game = store.state.game as Game;
const owner = GameHelper.getPlayerById(game, props.event.data.playerIdOwner)!;
const defenders = computed(() => props.event.data.playerIdDefenders.map(id => GameHelper.getPlayerById(game, id)!));
const attackers = computed(() => props.event.data.playerIdAttackers.map(id => GameHelper.getPlayerById(game, id)!));
const defenderCarriers = computed(() => props.event.data.combatResult.carriers.filter(c => defenders.value.find(d => d._id === c.ownedByPlayerId)));
const attackerCarriers = computed(() => props.event.data.combatResult.carriers.filter(c => attackers.value.find(a => a._id === c.ownedByPlayerId)));

const star = computed(() => props.event.data.combatResult.star!);

const getCarrierColour = (carrier: CombatCarrier<string>) => {
  return store.getters.getColourForPlayer(carrier.ownedByPlayerId).value
}

const getCarrierShape = (carrier: CombatCarrier<string>) => {
  return GameHelper.getPlayerById(store.state.game, carrier.ownedByPlayerId!)!.shape;
}

const getStarColour = () => {
  return store.getters.getColourForPlayer(props.event.data.playerIdOwner).value
}

const getStarShape = () => {
  return GameHelper.getPlayerById(store.state.game, props.event.data.playerIdOwner)!.shape;
}

const totalDefenderBefore = computed(() => GameHelper.calculateCombatEventShipCount(props.event.data.combatResult.star, defenderCarriers.value, "before"));
const totalDefenderLost = computed(() => GameHelper.calculateCombatEventShipCount(props.event.data.combatResult.star, defenderCarriers.value, "lost"));
const totalDefenderAfter = computed(() => GameHelper.calculateCombatEventShipCount(props.event.data.combatResult.star, defenderCarriers.value, "after"));
const totalAttackerBefore = computed(() => GameHelper.calculateCombatEventShipCount(null, attackerCarriers.value, "before"));
const totalAttackerLost = computed(() => GameHelper.calculateCombatEventShipCount(null, attackerCarriers.value, "lost"));
const totalAttackerAfter = computed(() => GameHelper.calculateCombatEventShipCount(null, attackerCarriers.value, "after"));
</script>

<style scoped>
.name-and-icon {
  display: inline-flex;
  align-items: center;
}

.name-and-icon svg {
  width: 12px;
  height: 12px;
  margin-right: 10px;
}
</style>
