<template>
  <view-container :is-auth-page="true">
    <view-title title="Main Menu" :hideHomeButton="true" :showSocialLinks="true"/>

    <warnings v-if="user" :warnings="user.warnings" />

    <div class="row pb-0 achievements">
      <div class="col-sm-12 col-md-6 col-lg-5">
        <p class="mb-1">A space strategy game filled with conquest, betrayal and subterfuge.</p>
        <p class="mb-2 mt-2"><small>Play <span class="text-warning">Solaris</span> on <a href="https://solaris.games" target="_blank" title="Web"><i class="fab fa-chrome me-1"></i>Web</a>, <a href="https://store.steampowered.com/app/1623930/Solaris/" target="_blank" title="Steam"><i class="fab fa-steam me-1"></i>Steam</a> and <a href="https://play.google.com/store/apps/details?id=com.voxel.solaris_android" target="_blank" title="Android"><i class="fab fa-google-play me-1"></i>Android</a>.</small></p>
        <announcements-button />
      </div>
      <div class="col-sm-12 col-md-6 col-lg-7">
        <!-- player quick stats -->
        <achievements v-if="achievements"
          :level="achievements.level"
          :victories="achievements.victories"
          :rank="achievements.rank"
          :renown="achievements.renown"/>
        <loading-spinner :loading="!achievements"></loading-spinner>
      </div>
    </div>

    <div class="row pb-0 pt-3">
      <poll></poll>
    </div>

    <div class="row pb-0 pt-3">
      <div class="col-sm-12 col-md-6 col-lg-6">
        <div class="card bg-dark text-white p-1" @click="routeToPath('/game/active-games')">
          <img class="card-img" :src="home1" alt="View my games">
          <div class="card-img-overlay">
            <h5 class="card-title">
              <i class="fas fa-user"></i>
              <span class="ms-2">My Games</span>
            </h5>
          </div>
          <div class="card-arrow">
            <div class="card-arrow-top-left"></div>
            <div class="card-arrow-top-right"></div>
            <div class="card-arrow-bottom-left"></div>
            <div class="card-arrow-bottom-right"></div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-6 col-lg-6" @click="routeToPath('/game/list')">
        <div class="card bg-dark text-white p-1">
          <img class="card-img" :src="home2" alt="Join a game">
          <div class="card-img-overlay">
            <h5 class="card-title">
              <i class="fas fa-gamepad"></i>
              <span class="ms-2">Join Game</span>
            </h5>
          </div>
          <div class="card-arrow">
            <div class="card-arrow-top-left"></div>
            <div class="card-arrow-top-right"></div>
            <div class="card-arrow-bottom-left"></div>
            <div class="card-arrow-bottom-right"></div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-4 col-lg-4">
        <div class="card bg-dark text-white p-1" @click="routeToPath('/leaderboard')">
          <img class="card-img" :src="home3" alt="Leaderboard">
          <div class="card-img-overlay">
            <h5 class="card-title">
              <i class="fas fa-list-ol"></i>
              <span class="ms-2">Leaderboard</span>
            </h5>
          </div>
          <div class="card-arrow">
            <div class="card-arrow-top-left"></div>
            <div class="card-arrow-top-right"></div>
            <div class="card-arrow-bottom-left"></div>
            <div class="card-arrow-bottom-right"></div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-4 col-lg-4">
        <div class="card bg-dark text-white p-1" @click="routeToPath('/guild')">
          <img class="card-img" :src="home4" alt="Guilds">
          <div class="card-img-overlay">
            <h5 class="card-title">
              <i class="fas fa-shield-alt"></i>
              <span class="ms-2">{{user && user.guildId ? 'My Guild' : 'Guilds'}}</span>
            </h5>
          </div>
          <div class="card-arrow">
            <div class="card-arrow-top-left"></div>
            <div class="card-arrow-top-right"></div>
            <div class="card-arrow-bottom-left"></div>
            <div class="card-arrow-bottom-right"></div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-4 col-lg-4">
        <div class="card bg-dark text-white p-1" @click="routeToPath('/avatars')">
          <img class="card-img" :src="home5" alt="Shop">
          <div class="card-img-overlay">
            <h5 class="card-title card-title-success">
              <i class="fas fa-shopping-basket"></i>
              <span class="ms-2">Avatar Shop</span>
            </h5>
          </div>
          <div class="card-arrow">
            <div class="card-arrow-top-left"></div>
            <div class="card-arrow-top-right"></div>
            <div class="card-arrow-bottom-left"></div>
            <div class="card-arrow-bottom-right"></div>
          </div>
        </div>
      </div>
    </div>

    <hr/>

    <tutorial-game />

    <hr/>
  </view-container>
</template>

<script setup lang="ts">
import home1 from '../assets/screenshots/home-1.png'
import home2 from '../assets/screenshots/home-2.png'
import home3 from '../assets/screenshots/home-3.png'
import home4 from '../assets/screenshots/home-4.png'
import home5 from '../assets/screenshots/home-5.png'
import {ref, onMounted, type Ref, inject} from 'vue';
import LoadingSpinner from './components/LoadingSpinner.vue'
import router from '../router'
import ViewContainer from './components/ViewContainer.vue'
import ViewTitle from './components/ViewTitle.vue'
import Achievements from './game/components/player/Achievements.vue'
import TutorialGame from './game/components/menu/TutorialGame.vue'
import Poll from "./components/Poll.vue";
import Warnings from "./account/Warnings.vue";
import AnnouncementsButton from "./components/AnnouncementsButton.vue";
import {detailMe} from "@/services/typedapi/user";
import {httpInjectionKey, isOk} from "@/services/typedapi/index";
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import type { UserPrivate, UserAchievements } from "@solaris-common";

const store: Store<State>  = useStore();

const httpClient = inject(httpInjectionKey)!;

const user: Ref<UserPrivate<string> | null> = ref(null);
const achievements: Ref<UserAchievements<string> | null> = ref(null);

const loadData = async () => {
  try {
    const response = await detailMe(httpClient)();

    if (isOk(response)) {
      user.value = response.data
      achievements.value = response.data.achievements

      store.commit('setUser', response.data)
      store.commit('setRoles', response.data.roles)
      store.commit('setUserCredits', response.data.credits)
      store.commit('setUserIsEstablishedPlayer', response.data.isEstablishedPlayer)
    }
  } catch (err) {
    console.error(err)
  }
}

const routeToPath = (path: string) => {
  router.push(path)
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.card {
  max-height: 150px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.card-img {
  object-fit: cover;
  max-height: 150px;
  min-height: 100%;
  width: auto;
}

.card-img-overlay {
  padding: 0.5rem;
}

.card-title {
  background-color: #375a7f;
  padding: 0.25rem;
  display: inline-block;
}

.card-title-success {
  background-color: #00bc8c;
}
</style>
