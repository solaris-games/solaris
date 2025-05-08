<template>
  <div>
    <view-subtitle title="Notifications" class="mt-3" level="h5" />

    <p>
      Configure your subscriptions for in-game notifications below. Whenever the subscribed event triggers you will
      receive a notification.
    </p>

    <loading-spinner :loading="!subscriptions" />

    <form @submit.prevent="handleSubmit" v-if="subscriptions" class="pb-2">
      <div>
        <h6 class="pt-2">Settings</h6>

        <div class="row pt-1 pb-1">
          <label for="notifyActiveGamesOnly" class="col-12 col-sm-6 col-form-label">Notify Active Games Only
            <help-tooltip
              tooltip="If enabled, you will receive notifications for games where you are not defeated." /></label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="notifyActiveGamesOnly"
              v-model="subscriptions.settings.notifyActiveGamesOnly" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h6 class="pt-2">In-app notifications</h6>

        <div v-if="subscriptions.inapp" class="row pt-1 pb-1">
          <label for="notifyForOtherGames" class="col-12 col-sm-6 col-form-label">Receive notifications about other
            games within the game <help-tooltip
              tooltip="If enabled, you will receive message notifications for all games while you are in Solaris, not only for the currently open game" /></label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="notifyForOtherGames"
              v-model="subscriptions.inapp.notificationsForOtherGames" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="subscriptions.discord">
        <h6 class="pt-2">Discord notifications</h6>

        <div class="row pt-1 pb-1">
          <label for="gameStarted" class="col-12 col-sm-6 col-form-label">Game - Started</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="gameStarted" v-model="subscriptions.discord.gameStarted"
              :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="gameEnded" class="col-12 col-sm-6 col-form-label">Game - Finished</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="gameEnded" v-model="subscriptions.discord.gameEnded" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="gameTurnEnded" class="col-12 col-sm-6 col-form-label">Game - Turn Ended</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="gameTurnEnded" v-model="subscriptions.discord.gameTurnEnded"
              :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerGalacticCycleComplete" class="col-12 col-sm-6 col-form-label">Game - Galactic Cycle
            Completed</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerGalacticCycleComplete"
              v-model="subscriptions.discord.playerGalacticCycleComplete" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerRenownReceived" class="col-12 col-sm-6 col-form-label">Game - Renown Received</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerRenownReceived" v-model="subscriptions.discord.playerRenownReceived"
              :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerResearchComplete" class="col-12 col-sm-6 col-form-label">Game - Research Completed</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerResearchComplete"
              v-model="subscriptions.discord.playerResearchComplete" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerTechnologyReceived" class="col-12 col-sm-6 col-form-label">Trade - Technology
            Received</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerTechnologyReceived"
              v-model="subscriptions.discord.playerTechnologyReceived" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerCreditsReceived" class="col-12 col-sm-6 col-form-label">Trade - Credits Received</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerCreditsReceived"
              v-model="subscriptions.discord.playerCreditsReceived" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="playerCreditsSpecialistsReceived" class="col-12 col-sm-6 col-form-label">Trade - Specialist Tokens
            Received</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="playerCreditsSpecialistsReceived"
              v-model="subscriptions.discord.playerCreditsSpecialistsReceived" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div class="row pt-1 pb-1">
          <label for="conversationMessageSent" class="col-12 col-sm-6 col-form-label">Diplomacy - Message
            Received</label>
          <div class="col-12 col-sm-6">
            <select class="form-control" id="conversationMessageSent"
              v-model="subscriptions.discord.conversationMessageSent" :disabled="isSaving">
              <option :value="true">Enabled</option>
              <option :value="false">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- <form-error-list v-bind:errors="errors"/> -->

      <div class="row mt-2">
        <div class="col"></div>
        <div class="col-auto">
          <button type="submit" class="btn btn-success" :disabled="isSaving"><i class="fas fa-save"></i> Save
            Notifications</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import ViewSubtitle from '../../components/ViewSubtitle.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import HelpTooltip from '../../components/HelpTooltip.vue'
import { onMounted, ref, type Ref, inject } from 'vue'
import type { UserSubscriptions } from '@solaris-common'
import { getSubscriptions, saveSubscriptions } from '@/services/typedapi/user'
import { httpInjectionKey, isOk, ResponseResultKind } from '@/services/typedapi'
import { toastInjectionKey } from '@/util/keys'

const httpClient = inject(httpInjectionKey)!
const toast = inject(toastInjectionKey)!

const isSaving = ref(false);
const errors: Ref<string[]> = ref([]);
const subscriptions: Ref<UserSubscriptions | null> = ref(null);

const handleSubmit = async (e: Event) => {
  if (!subscriptions.value) {
    return;
  }

  errors.value = []

  e.preventDefault()

  if (errors.value.length) {
    return;
  }

  isSaving.value = true

  const response = await saveSubscriptions(httpClient)(subscriptions.value);

  if (isOk(response)) {
    toast.success('Subscriptions saved');
  } else {
    console.error(response.cause);

    if (response.kind === ResponseResultKind.ResponseError) {
      errors.value = JSON.parse(response.data)?.errors || [];
    } else {
      toast.error('Failed to save subcriptions');
    }
  }

  isSaving.value = false;
}

onMounted(async () => {
  subscriptions.value = null;

  const response = await getSubscriptions(httpClient)();

  if (isOk(response)) {
    subscriptions.value = response.data;
  } else {
    console.error(response.cause);
  }
});
</script>

<style scoped></style>
