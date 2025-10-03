<template>
  <div>
    <div class="row text-center bg-primary mb-2">
      <div class="col">
        <p class="mb-0 mt-2 mb-2">Select a race and an alias for your commander.</p>
      </div>
    </div>

    <div class="row bg-dark p-2">
      <div class="col">
        <form @submit.prevent>
          <div class="row">
            <div class="col-auto bg-dark">
              <select-avatar v-on:onAvatarChanged="onAvatarChanged" />
            </div>
            <div class="col pt-0">
              <p v-if="!avatar">Every great story needs both heroes and villains. Which will you be?</p>

              <h5 v-if="avatar">{{ avatar.name }}</h5>
              <p v-if="avatar"><small class="linebreaks">{{ avatar.description }}</small></p>

              <div class="mb-2">
                <input name="alias" class="form-control" :required="true" placeholder="Enter your alias here"
                  type="text" minlength="1" maxlength="24" v-model="alias">
              </div>

              <div v-if="isAnonymousGame" class="alert alert-warning">
                <p>This game is anonymous, you might want to hide your identity!</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, watch } from 'vue';
import SelectAvatar from './SelectAvatar.vue'
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { detailMe } from '@/services/typedapi/user';
import type {UserAvatar} from "@solaris-common";

const props = defineProps<{
  isAnonymousGame: boolean,
}>();

const emit = defineEmits<{
  onAliasChanged: [alias: string],
  onAvatarChanged: [avatar: number],
}>();

const httpClient = inject(httpInjectionKey)!;

const alias = ref<string>("");
const avatar = ref<UserAvatar | null>(null);

const onAliasChanged = (value: string) => {
  emit('onAliasChanged', value);
};

watch(alias, onAliasChanged);

const onAvatarChanged = (e: UserAvatar) => {
  avatar.value = e;
  emit('onAvatarChanged', e.id);
};

onMounted(async () => {
  const response = await detailMe(httpClient)();

  if (isOk(response)) {
    alias.value = response.data.username;
    onAliasChanged(alias.value);
  } else {
    console.error(formatError(response));
  }
});
</script>

<style scoped>
.linebreaks {
  white-space: break-spaces;
}
</style>
