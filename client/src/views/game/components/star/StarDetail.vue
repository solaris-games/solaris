<template>
<div class="menu-page container" v-if="star">
    <menu-title :title="title" @onCloseRequested="onCloseRequested">
      <ignore-bulk-upgrade v-if="star.ignoreBulkUpgrade && isOwnedByUserPlayer" :starId="star._id" class="me-1"/>
      <modalButton modalName="abandonStarModal" v-if="!$isHistoricalMode() && isOwnedByUserPlayer && !userPlayer.defeated && isGameInProgress() && isGameAllowAbandonStars()" classText="btn btn-sm btn-outline-danger">
        <i class="fas fa-star"></i> <i class="fas fa-trash ms-1"></i>
      </modalButton>
      <button @click="viewOnMap(star)" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <div class="row bg-dark">
      <div class="col text-center pt-2">
        <p class="mb-2 text-info">
          Location: {{formatLocation(star.location)}}
          <help-tooltip v-if="isGameDarkMode" tooltip="Coordinates are scrambled because this is a dark mode game."/>
        </p>
        <p class="mb-2" v-if="isOwnedByUserPlayer">A star under your command.</p>
        <p class="mb-2" v-if="star.ownedByPlayerId != null && (!userPlayer || star.ownedByPlayerId != userPlayer._id)">This star is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{starOwningPlayer.alias}}</a>.</p>
        <p class="mb-2" v-if="star.ownedByPlayerId == null">This star has not been claimed by any faction.<br/>Send a carrier here to claim it for yourself!</p>
        <div v-if="star.ownedByPlayerId != null && star.homeStar ">
          <p class="mb-2 text-info" v-if="userPlayer && isOwnedByUserPlayer && star.ownedByPlayerId == originalCapitalOwner._id"><small>This is your capital.</small></p>
          <p class="mb-2 text-info" v-if="!isOwnedByUserPlayer && star.ownedByPlayerId == originalCapitalOwner._id"><small>This is their capital.</small></p>
          <p class="mb-2 text-info" v-if="star.ownedByPlayerId != originalCapitalOwner._id"><small>The former capital of <a href="javascript:;" @click="onOpenOriginalCapitalOwner">{{originalCapitalOwner.alias}}</a>.</small></p>
        </div>
        <p class="mb-2 text-danger" v-if="isDeadStar">This is a dead star, infrastructure cannot be built here.</p>
        <p class="mb-2 text-danger" v-if="star.targeted">This star has been targeted for destruction!</p>
        <p class="mb-2 text-danger" v-if="star.isKingOfTheHillStar">Capture and hold this star to win!</p>

        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.isNebula">
          <hr/>
          <p class="mb-0">This star is hidden inside a <span class="text-warning">Nebula <star-icon isNebula="true"></star-icon></span>.</p>
          <p class="mb-2 text-info"><small><i>Nebulas conceal the infrastructure and ship counts at the star from all other players.</i></small></p>
        </div>

        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.isAsteroidField">
          <hr/>
          <p class="mb-0" v-if="star.isAsteroidField">This star is surrounded by an <span class="text-warning">Asteroid Field <star-icon isAsteroidField="true"></star-icon></span>.</p>
          <p class="mb-2 text-info" v-if="star.isAsteroidField"><small><i>Asteroid Fields have +1 Defender Bonus (net +2 Weapons) in combat.</i></small></p>
        </div>

        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.isBinaryStar">
          <hr/>
          <p class="mb-0" v-if="star.isBinaryStar">This is a <span class="text-warning">Binary Star <star-icon isBinaryStar="true"></star-icon></span> system.</p>
          <p class="mb-2 text-info" v-if="star.isBinaryStar"><small><i>Binary Stars start with additional natural resources.</i></small></p>
        </div>

        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.wormHoleToStarId">
          <hr/>
          <p class="mb-0" v-if="wormHolePairStar">This star is a <span class="text-warning">Worm Hole <star-icon :isWormHole="true"></star-icon></span> to <a href="javascript:;" @click="viewOnMap(wormHolePairStar)"><i class="fas fa-eye me-1"></i>{{wormHolePairStar.name}}</a>.</p>
          <p class="mb-0" v-if="!wormHolePairStar">This star is a <span class="text-warning">Worm Hole <star-icon :isWormHole="true"></star-icon></span> to an unknown star.</p>
          <p class="mb-2 text-info"><small><i>Travel between Worm Holes takes 1 tick.</i></small></p>
        </div>
        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.warpGate">
        <hr/>
          <p class="mb-0">This star has a <span class="text-warning">Warp Gate <i class="fas fa-dungeon"></i></span>.</p>
          <p class="mb-2 text-info"><small><i>Carriers travel {{ warpSpeedMultiplier }}x faster between active warp gates.</i></small></p>
        </div>
        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.isBlackHole">
          <hr/>
          <p class="mb-0" v-if="star.isBlackHole">This star is a <span class="text-warning">Black Hole <star-icon :isBlackHole="true"></star-icon></span>.</p>
          <p class="mb-2 text-info" v-if="star.isBlackHole"><small><i>Black Holes have +3 Scanning Range but have reduced natural resources.</i></small></p>
        </div>
        <div v-if="(!isCompactUIStyle || !star.ownedByPlayerId) && star.isPulsar">
          <hr/>
          <p class="mb-0" v-if="star.isPulsar">This star is a <span class="text-warning">Pulsar <star-icon :isPulsar="true"></star-icon></span>.</p>
          <p class="mb-2 text-info" v-if="star.isPulsar"><small><i>Pulsars are always visible to all players in the game.</i></small></p>
        </div>
      </div>
    </div>
    <div v-if="isCompactUIStyle && star.isInScanningRange">
      <div class="row mt-2" v-if="!isDeadStar">
        <div class="col">
          <table class="star-resources-table">
            <tbody>
              <tr>
                <star-resources :resources="star.naturalResources" :compareResources="star.terraformedResources" :iconAlignLeft="true" />
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-auto">
          <span v-if="star.isNebula" title="Star is obscured inside a nebula - All ship counts are hidden from other players">
            <star-icon :isNebula="true" class="ms-1"></star-icon>
          </span>
          <span v-if="star.isAsteroidField" title="Star is surrounded by an asteroid field - +1 defender bonus (net +2 weapons) in combat">
            <star-icon :isAsteroidField="true" class="ms-1"></star-icon>
          </span>
          <span v-if="star.isBinaryStar" title="Binary Star - The system has additional natural resources">
            <star-icon :isBinaryStar="true" class="ms-1"></star-icon>
          </span>
          <span v-if="star.wormHoleToStarId" title="The star has a worm hole - Connected to another worm hole somewhere in the galaxy">
            <star-icon :isWormHole="true" class="ms-1"></star-icon>
          </span>
          <span v-if="star.isBlackHole" title="Black Hole - The star has +3 scanning range but reduced natural resources">
            <star-icon :isBlackHole="true" class="ms-1"></star-icon>
          </span>
          <span v-if="star.isPulsar" title="Pulsar - The star is always visible to all players in the game">
            <star-icon :isPulsar="true" class="ms-1"></star-icon>
          </span>
          <span :title="star.warpGate ? 'Warp Gate - Carriers travel faster between active warp gates':'No Warp Gate'" :class="{'no-warp-gate':!star.warpGate}">
            <i class="fas fa-dungeon ms-2"></i>
          </span>
        </div>
      </div>

      <div class="row mt-2 pb-2">
        <div class="col">
          <span v-if="star.infrastructure && !isDeadStar" title="Economic infrastructure">
              <i class="fas fa-money-bill-wave text-success"></i> {{star.infrastructure.economy}}
          </span>
          <span v-if="star.infrastructure && !isDeadStar" title="Industrial infrastructure" class="ms-2">
              <i class="fas fa-tools text-warning"></i> {{star.infrastructure.industry}}
          </span>
          <span v-if="star.infrastructure && !isDeadStar" title="Scientific infrastructure" class="ms-2">
              <i class="fas fa-flask text-info"></i> {{star.infrastructure.science}}
          </span>
        </div>
        <div class="col-auto">
          <span title="Scanning range" v-if="star.ownedByPlayerId">
            {{star.effectiveTechs.scanning}} <i class="fas fa-binoculars ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="Terraforming" v-if="star.ownedByPlayerId">
            {{star.effectiveTechs.terraforming}} <i class="fas fa-globe-europe ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="Total known garrison" v-if="star.ownedByPlayerId">
            {{star.ships == null ? '???' : star.ships}} <i class="fas fa-rocket ms-1"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2" v-if="canShowSpecialist || star.ownedByPlayerId">
        <div class="col">
          <span v-if="canShowSpecialist && isOwnedByUserPlayer && canHireSpecialist">
            <specialist-icon :type="'star'" :defaultIcon="'user-astronaut'" :specialist="star.specialist"></specialist-icon>
            <a href="javascript:;" @click="onViewHireStarSpecialistRequested">
              <span class="ms-1" v-if="star.specialistId" :title="star.specialist.description">{{star.specialist.name}}</span>
              <span v-if="!star.specialistId">No Specialist</span>
            </a>
            <span v-if="star.specialistId && star.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{star.specialistExpireTick}}</span>
          </span>
          <span v-if="canShowSpecialist && (!isOwnedByUserPlayer || !canHireSpecialist)">
            <specialist-icon :type="'star'" :defaultIcon="'user-astronaut'" :specialist="star.specialist"></specialist-icon>
            <span v-if="star.specialist" class="ms-1">{{star.specialist.name}}</span>
            <span v-if="star.specialistId && star.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{star.specialistExpireTick}}</span>
            <span v-if="!star.specialist">No Specialist</span>
          </span>
        </div>
        <div class="col-auto">
          <span title="Weapons" v-if="star.ownedByPlayerId">
            {{star.effectiveTechs.weapons}} <i class="fas fa-gun ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span v-if="star.ownedByPlayerId && !isDeadStar" title="Manufacturing">
            {{star.effectiveTechs.manufacturing}} <i class="fas fa-industry ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span v-if="star.ownedByPlayerId && !isDeadStar" title="Ship production per tick">
            {{star.manufacturing || '???'}} <i class="fas fa-wrench ms-1"></i>
          </span>
        </div>

        <div class="col-auto">
          <span v-if="star.ownedByPlayerId && !isDeadStar && ticksToBonusShip" :title="`Ticks to ${(star.manufacturing > 1 ? 'bonus' : 'next')} ship`">
            {{ticksToBonusShip}} <i class="fas fa-spinner ms-1"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2" v-if="star.specialist">
        <div class="col">
          <p class="mb-0"><small>{{star.specialist.description}}</small></p>
        </div>
      </div>

      <div class="mb-0" v-if="!isDeadStar">
        <infrastructureUpgradeCompact
          v-if="isOwnedByUserPlayer && !userPlayer.defeated && star.upgradeCosts != null"
          :star="star"
          :availableCredits="userPlayer.credits"
          :economy="star.upgradeCosts.economy"
          :industry="star.upgradeCosts.industry"
          :science="star.upgradeCosts.science"
          v-on:onEditWaypointsRequested="onEditWaypointsRequested"
          v-on:onBuildCarrierRequested="onBuildCarrierRequested"/>
      </div>
    </div>

    <div v-if="isStandardUIStyle && star.isInScanningRange">
      <div v-if="star.ownedByPlayerId" class="row mb-0 pt-2 pb-2 bg-primary">
          <div class="col">
              Ships
          </div>
          <div class="col text-end">
            <span>{{star.ships == null ? '???' : star.ships}}</span>
            <i class="fas fa-rocket ms-2"></i>
          </div>
      </div>

      <div v-if="!isDeadStar" class="row pt-1 pb-1">
          <div class="col">
              Natural Resources
          </div>
          <div class="col text-end">
              <table class="star-resources-table">
                  <tbody>
                    <tr>
                      <star-resources :resources="star.naturalResources" :iconAlignLeft="false" />
                    </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <div v-if="!isDeadStar" class="row pt-1 pb-1 bg-dark">
          <div class="col">
              Terraformed Resources
          </div>
          <div class="col text-end">
              <table class="star-resources-table">
                  <tbody>
                    <tr>
                      <star-resources :resources="star.terraformedResources" :iconAlignLeft="false" />
                    </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <div v-if="star.ownedByPlayerId" class="row pt-1 pb-1">
          <div class="col">
              Weapons
          </div>
          <div class="col text-end" title="Weapons">
            <span>{{star.effectiveTechs.weapons}}</span>
            <i class="fas fa-gun ms-2"></i>
          </div>
      </div>

      <div v-if="star.ownedByPlayerId" class="row pt-1 pb-1 bg-dark">
          <div class="col">
              Scanning
          </div>
          <div class="col text-end" title="Scanning">
            <span>{{star.effectiveTechs.scanning}}</span>
            <i class="fas fa-binoculars ms-2"></i>
          </div>
      </div>

      <div v-if="star.ownedByPlayerId" class="row pt-1 pb-1">
          <div class="col">
              Terraforming
          </div>
          <div class="col text-end" title="Terraforming">
            <span>{{star.effectiveTechs.terraforming}}</span>
            <i class="fas fa-globe-europe ms-2"></i>
          </div>
      </div>

      <div v-if="star.ownedByPlayerId && !isDeadStar" class="row pt-1 pb-1 bg-dark">
          <div class="col">
              Manufacturing
          </div>
          <div class="col text-end" title="Manufacturing">
            <span>{{star.effectiveTechs.manufacturing}}</span>
            <i class="fas fa-industry ms-2"></i>
          </div>
      </div>

      <div v-if="star.ownedByPlayerId && !isDeadStar" class="row pt-1 pb-1">
          <div class="col">
              Ship Production
          </div>
          <div class="col text-end" title="Ship production per tick">
            <span>{{star.manufacturing || '???'}}</span>
            <i class="fas fa-wrench ms-2"></i>
          </div>
      </div>


      <div v-if="star.ownedByPlayerId && !isDeadStar && ticksToBonusShip" class="row pt-1 pb-1 bg-dark">
        <div class="col">
          Ticks to {{(star.manufacturing > 1 ? 'bonus' : 'next')}} ship
        </div>
        <div class="col text-end" :title="`Ticks to ${(star.manufacturing > 1 ? 'bonus' : 'next')} ship`">
          <span>{{ticksToBonusShip}}</span>
          <i class="fas fa-spinner ms-1"></i>
        </div>
      </div>
    </div>

    <div v-if="getCarriersInOrbit().length">
      <div class="row pt-2">
        <div class="col">
          <h4>Carriers</h4>
        </div>
        <div class="col-auto">
          <button title="Distribute ships evenly to carriers" v-if="isOwnedByUserPlayer" type="button" class="btn btn-sm btn-outline-secondary" @click="distributeAllShips()">
            <i class="fas fa-arrow-down-wide-short"></i>
            Distribute
          </button>
          <button title="Transfer all ships to the star" v-if="isOwnedByUserPlayer" type="button" class="btn btn-sm btn-outline-primary ms-1" @click="transferAllToStar()">
            <i class="fas fa-arrow-up-wide-short"></i>
            Garrison
          </button>
        </div>
      </div>

      <div v-for="carrier in getCarriersInOrbit()" :key="carrier._id" class="row mb-1 pt-1 pb-0 bg-dark">
        <div class="col-auto pe-0">
          <specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="carrier.specialist"/>
        </div>
        <div class="col ps-1">
          <a href="javascript:;" @click="onOpenCarrierDetailRequested(carrier)">{{carrier.name}}</a>
        </div>
        <div class="col-auto pe-0">
          <i class="fas fa-map-marker-alt"></i>
          <i class="fas fa-sync ms-1" v-if="carrier.waypointsLooped"></i> {{carrier.waypoints.length}}
        </div>
        <div class="col-3 text-end">
          <i class="fas fa-rocket"></i> {{carrier.ships == null ? '???' : carrier.ships}}
        </div>
        <div class="col-auto ps-0">
          <a href="javascript:;" v-if="!$isHistoricalMode() && isOwnedByUserPlayer && !isGameFinished" title="Transfer ships between the star and carrier" @click="onShipTransferRequested(carrier)"><i class="fas fa-exchange-alt"></i></a>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle && !isDeadStar">
      <div v-if="star.infrastructure" class="mb-2">
        <h4 class="pt-2">Infrastructure</h4>

        <infrastructure :starId="star._id"/>

        <infrastructureUpgrade v-if="isOwnedByUserPlayer && !userPlayer.defeated && star.upgradeCosts != null"
          :star="star"
          :availableCredits="userPlayer.credits"
          :economy="star.upgradeCosts.economy"
          :industry="star.upgradeCosts.industry"
          :science="star.upgradeCosts.science"/>
      </div>

      <!-- TODO: Turn these into components -->
      <div v-if="isOwnedByUserPlayer && !userPlayer.defeated && star.upgradeCosts != null">
        <div class="row bg-dark pt-2 pb-0 mb-1">
          <div class="col-8">
            <p class="mt-1 mb-2">Build a <strong>Carrier</strong> to transport ships through hyperspace.</p>
          </div>
          <div class="col-4">
            <div class="d-grid gap-2">
              <button :disabled="$isHistoricalMode() || userPlayer.credits < star.upgradeCosts.carriers || star.ships < 1 || isGameFinished"
                class="btn btn-info mb-2"
                @click="onBuildCarrierRequested">
                <i class="fas fa-rocket"></i>
                Build for ${{star.upgradeCosts.carriers}}
              </button>
            </div>
          </div>
        </div>

        <div class="row bg-dark pt-2 pb-0 mb-1" v-if="(canBuildWarpGates && !star.warpGate) || (canDestroyWarpGates && star.warpGate)">
          <div class="col-8">
            <p class="mt-1 mb-2">Build a <strong>Warp Gate</strong> to accelerate carrier movement.</p>
          </div>
          <div class="col-4">
            <div class="d-grid gap-2">
              <button v-if="canBuildWarpGates && !star.warpGate"
                :disabled="$isHistoricalMode() || userPlayer.credits < star.upgradeCosts.warpGate || isGameFinished"
                @click="buildWarpGate"
                class="btn btn-success mb-2">
                <i class="fas fa-dungeon"></i>
                Build for ${{star.upgradeCosts.warpGate}}
              </button>
            </div>
            <div class="d-grid gap-2">
              <button v-if="canDestroyWarpGates && star.warpGate"
                :disabled="$isHistoricalMode() || isGameFinished"
                @click="destroyWarpGate"
                class="btn btn-outline-danger mb-2">
                <i class="fas fa-trash"></i>
                Destroy Gate
              </button>
            </div>
          </div>
        </div>

        <div class="row bg-dark pt-2 pb-0 mb-1" v-if="isGameInProgress() && isGameAllowAbandonStars()">
          <div class="col-8">
            <p class="mb-2">Abandon this star for another player to claim.</p>
          </div>
          <div class="col-4">
            <div class="d-grid gap-2">
              <modalButton modalName="abandonStarModal" classText="btn btn-outline-danger mb-2" :disabled="$isHistoricalMode()">
                <i class="fas fa-trash"></i>
                Abandon Star
              </modalButton>
            </div>
          </div>
        </div>
      </div>

      <h4 class="pt-2" v-if="canShowSpecialist">Specialist</h4>

      <star-specialist v-if="canShowSpecialist" :starId="star._id" @onViewHireStarSpecialistRequested="onViewHireStarSpecialistRequested"/>
    </div>

    <!-- Modals -->

    <dialogModal modalName="abandonStarModal" titleText="Abandon Star" cancelText="No" confirmText="Yes" @onConfirm="confirmAbandonStar">
      <p>Are you sure you want to abandon <b>{{star.name}}</b>?</p>
      <p>Its Economy, Industry and Science will remain, but all ships and carriers at this star will be destroyed.</p>
    </dialogModal>
</div>
</template>

<script>
import starService from '../../../../services/api/star'
import AudioService from '../../../../game/audio'
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle.vue'
import Infrastructure from '../shared/Infrastructure.vue'
import InfrastructureUpgrade from './InfrastructureUpgrade.vue'
import InfrastructureUpgradeCompact from './InfrastructureUpgradeCompact.vue'
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import StarSpecialistVue from './StarSpecialist.vue'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import gameHelper from '../../../../services/gameHelper'
import IgnoreBulkUpgradeVue from './IgnoreBulkUpgrade.vue'
import StarResourcesVue from './StarResources.vue'
import StarIconVue from './../star/StarIcon.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import {formatLocation} from "client/src/util/format";
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  components: {
    'menu-title': MenuTitle,
    'infrastructure': Infrastructure,
    'infrastructureUpgrade': InfrastructureUpgrade,
    'infrastructureUpgradeCompact': InfrastructureUpgradeCompact,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'star-specialist': StarSpecialistVue,
    'specialist-icon': SpecialistIconVue,
    'ignore-bulk-upgrade': IgnoreBulkUpgradeVue,
    'star-resources': StarResourcesVue,
    'star-icon': StarIconVue,
    'help-tooltip': HelpTooltip,
  },
  props: {
    starId: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      audio: null,
      userPlayer: null,
      currentPlayerId: null,
      canBuildWarpGates: false,
      canDestroyWarpGates: false,
      isSpecialistsEnabled: false,
      isStandardUIStyle: false,
      isCompactUIStyle: false,
      warpSpeedMultiplier: '',
    }
  },
  mounted () {
    this.isStandardUIStyle = this.$store.state.settings.interface.uiStyle === 'standard'
    this.isCompactUIStyle = this.$store.state.settings.interface.uiStyle === 'compact'

    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    this.canBuildWarpGates = this.$store.state.game.settings.specialGalaxy.warpgateCost !== 'none'
    this.canDestroyWarpGates = this.$store.state.game.state.startDate != null
    this.warpSpeedMultiplier = this.$store.state.game.constants.distances.warpSpeedMultiplier

    // Can display specialist section if sepcialists are enabled and the star is owned by a player.
    // Otherwise if the star is unowned then display only if the star is within scanning range and it has a specialist on it.
    this.isSpecialistsEnabled = this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none'
  },
  methods: {
    formatLocation,
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
    },
    onViewHireStarSpecialistRequested (e) {
      this.$emit('onViewHireStarSpecialistRequested', this.starId)
    },
    onShipTransferRequested (e) {
      if (e.orbiting) {
        this.$emit('onShipTransferRequested', e._id)
      }
    },
    getCarriersInOrbit () {
      return GameHelper.getCarriersOrbitingStar(this.$store.state.game, this.star)
    },
    isGameInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    isGameAllowAbandonStars () {
      return GameHelper.isGameAllowAbandonStars(this.$store.state.game)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.star.ownedByPlayerId)
    },
    onOpenOriginalCapitalOwner (e) {
      this.$emit('onOpenPlayerDetailRequested', this.originalCapitalOwner._id)
    },
    onOpenCarrierDetailRequested (carrier) {
      this.$emit('onOpenCarrierDetailRequested', carrier._id)
    },
    onEditWaypointsRequested (carrierId) {
      this.$emit('onEditWaypointsRequested', carrierId)
    },
    onBuildCarrierRequested () {
      this.$emit('onBuildCarrierRequested', this.star._id)
    },
    viewOnMap (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: e });
    },
    async confirmAbandonStar (e) {
      try {
        const response = await starService.abandonStar(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`${this.star.name} has been abandoned.`)

          this.$store.commit('gameStarAbandoned', {
            starId: this.star._id
          })

          AudioService.leave()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async buildWarpGate (e) {
      if (this.$store.state.settings.star.confirmBuildWarpGate === 'enabled' && !await this.$confirm('Build Warp Gate', `Are you sure you want build a Warp Gate at ${this.star.name}? The upgrade will cost $${this.star.upgradeCosts.warpGate}.`)) {
        return
      }

      try {
        const response = await starService.buildWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Warp Gate built at ${this.star.name}.`)

          this.$store.commit('gameStarWarpGateBuilt', response.data)

          AudioService.join()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async destroyWarpGate (e) {
      if (!await this.$confirm('Destroy Warp Gate', `Are you sure you want destroy Warp Gate at ${this.star.name}?`)) {
        return
      }

      try {
        const response = await starService.destroyWarpGate(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          this.$toast.default(`Warp Gate destroyed at ${this.star.name}.`)

          this.$store.commit('gameStarWarpGateDestroyed', {
            starId: this.star._id
          })

          AudioService.leave()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async transferAllToStar() {
      try {
        let response = await starService.transferAllToStar(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          let carriers = response.data.carriers

          carriers.forEach(responseCarrier => {
            let mapObjectCarrier = gameHelper.getCarrierById(this.$store.state.game, responseCarrier._id)
            mapObjectCarrier.ships = responseCarrier.ships
          })

          this.star.ships = response.data.star.ships

          this.$toast.default(`All ships transfered to ${this.star.name}.`)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async distributeAllShips() {
      try {
        let response = await starService.distributeAllShips(this.$store.state.game._id, this.star._id)

        if (response.status === 200) {
          let carriers = response.data.carriers

          carriers.forEach(responseCarrier => {
            let mapObjectCarrier = gameHelper.getCarrierById(this.$store.state.game, responseCarrier._id)
            mapObjectCarrier.ships = responseCarrier.ships
          })

          this.star.ships = response.data.star.ships

          this.$toast.default(`All ships at ${this.star.name} distributed to carriers in orbit.`)
        }
      } catch (err) {
        console.log(err)
      }
    }
  },
  computed: {
    title: function () {
      if (this.star.homeStar) {
        return `${this.star.name} - Capital`;
      }

      return this.star.name;
    },
    star: function () {
      return GameHelper.getStarById(this.$store.state.game, this.starId)
    },
    starOwningPlayer: function () {
      return GameHelper.getStarOwningPlayer(this.$store.state.game, this.star)
    },
    originalCapitalOwner: function() {
      return GameHelper.getOriginalOwner(this.$store.state.game, this.star)
    },
    canShowSpecialist: function () {
      return this.isSpecialistsEnabled && (this.star.specialistId || this.isOwnedByUserPlayer) && !this.isDeadStar
    },
    canHireSpecialist: function () {
      return this.canShowSpecialist
        && !GameHelper.isGameFinished(this.$store.state.game)
        && !this.isDeadStar
        && (!this.star.specialistId || !this.star.specialist.oneShot)
    },
    isOwnedByUserPlayer: function() {
      let owner = GameHelper.getStarOwningPlayer(this.$store.state.game, this.star)

      return owner && this.userPlayer && owner._id === this.userPlayer._id
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    isDeadStar: function () {
      return GameHelper.isDeadStar(this.star)
    },
    wormHolePairStar: function () {
      if (!this.star.wormHoleToStarId) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.star.wormHoleToStarId)
    },
    ticksToBonusShip: function () {
      return GameHelper.calculateTicksToBonusShip(this.star.shipsActual, this.star.manufacturing)
    },
    isGameDarkMode () {
      return GameHelper.isDarkMode(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
.no-warp-gate {
  opacity: 0.1;
}
.star-resources-table {
  float: right;
}
</style>
