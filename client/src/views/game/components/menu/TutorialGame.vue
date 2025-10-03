<template>
    <div>
        <div class="row">
            <div class="col-sm-12 col-md-6 col-lg-6">
                <div class="card bg-dark text-white tutorial-game p-1" @click="viewTutorial()">
                    <img class="card-img" :src="tutorial" alt="View Tutorial">
                    <div class="card-img-overlay">
                        <h5 class="card-title tutorial-card-title">
                            <i class="fas fa-user-graduate"></i>
                            <span class="ms-2">Tutorial</span>
                        </h5>
                        <p class="card-title card-subtitle">
                            Learn to Play
                        </p>
                    </div>
                    <div class="card-arrow">
                        <div class="card-arrow-top-left"></div>
                        <div class="card-arrow-top-right"></div>
                        <div class="card-arrow-bottom-left"></div>
                        <div class="card-arrow-bottom-right"></div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-6 col-lg-6 pl-md-0">
                <div class="row">
                    <div class="col-12">
                        <h4>Learn to Play</h4>
                        <p>
                            New to <span class="text-info">Solaris</span>? Learn the basics by completing the tutorial and when you're ready, join a standard game to fight against real players.
                        </p>
                    </div>
                    <div class="col-12">
                        <div class="row">
                            <div class="col"></div>
                            <div class="col-auto">
                                <a href="https://steamcommunity.com/app/1623930/discussions/" target="_blank" title="Forum" class="btn btn-info me-2 mb-1 float-end">
                                    <i class="far fa-comments"></i>
                                </a>
                                <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="btn btn-success me-2 mb-1 float-end">
                                    <i class="fab fa-discord"></i> Discord
                                </a>

                                <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2828060521" target="_blank" title="Getting Started" class="btn btn-outline-warning me-2 mb-1 float-end">
                                    <i class="fas fa-handshake-angle"></i> Getting Started
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import router from '../../../../router';
import { inject } from 'vue';
import { useStore, type Store } from 'vuex';
import tutorial from '../../../../assets/screenshots/tutorial.png';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { makeConfirm } from '@/util/confirm';
import { createTutorial } from '@/services/typedapi/game';

const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);

const viewTutorial = async () => {
  if (!await confirm(`Start Tutorial`, `You are about to start the tutorial, are you sure you want to continue?`)) {
    return;
  }

  const response = await createTutorial(httpClient)();

  if (isOk(response)) {
    router.push({ name: 'game', query: { id: response.data.gameId } })
  } else {
    console.error(formatError(response));
  }
};
</script>

<style scoped>
.card {
  height: 175px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.card-img {
  object-fit: cover;
  max-width: 100%;
  max-height: 100%;
}

/* .featured-card .card-img {
  max-height: 250px;
} */

.card-img-overlay {
  padding: 0.5rem;
}

.card-title {
  background-color: #375a7f;
  padding: 0.25rem;
  display: inline-block;
}

.card-subtitle {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 8px;
  background-color: #3498DB;
}

.tutorial-card-title {
  background-color: #3498DB;
}

.tutorial-game {
  /* border: 3px solid #3498DB; */
}
</style>
