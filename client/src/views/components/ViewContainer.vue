<template>
  <div class="solaris-app">
    <view-container-top-bar v-if="!props.hideTopBar" />
    <div class="content">
      <div class="container col-xs-12 col-sm-10 col-md-10 col-lg-10">
        <slot></slot>
      </div>
      <view-container-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import ViewContainerTopBar from "./ViewContainerTopBar.vue";
import { withMessages } from "../../util/messages";
import { onMounted, inject } from "vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { httpInjectionKey } from "@/services/typedapi";
import { userClientSocketEmitterInjectionKey } from "@/sockets/socketEmitters/user.ts";
import ViewContainerFooter from "@/views/components/ViewContainerFooter.vue";

const props = defineProps<{
  isAuthPage: boolean;
  hideTopBar?: boolean;
}>();

const httpClient = inject(httpInjectionKey)!;
const userClientSocketEmitter = inject(userClientSocketEmitterInjectionKey)!;

const userStore = useUserStore();

if (props.isAuthPage) {
  withMessages();
}

onMounted(async () => {
  if (props.isAuthPage && !userStore.userId) {
    const isOk = await userStore.verify(httpClient, userClientSocketEmitter);

    if (!isOk) {
      router.push({ name: "home" });
    }
  }
});
</script>

<style scoped>
.solaris-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  min-height: 0;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.container {
  flex-grow: 1;
}
</style>
