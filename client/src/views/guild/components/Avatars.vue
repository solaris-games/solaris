<template>
  <div v-if="avatarIds?.length" class="mt-2 mb-1">
    <h4>Guild Avatars</h4>
    <picture style="display: contents" v-for="avatar in guildAvatars">
      <source
        v-if="getAvatarWebpImage(avatar)"
        :srcset="getAvatarWebpImage(avatar)"
        type="image/webp"
      />
      <img :src="getAvatarImage(avatar)" width="128" height="128" />
    </picture>
  </div>
</template>

<script setup lang="ts">
import { listMyAvatars } from "@/services/typedapi/user.ts";
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import { inject, onMounted, ref } from "vue";
import type { UserAvatar } from "@solaris/common";
import {
  getAvatarImage,
  getAvatarWebpImage,
} from "@/views/game/components/avatar/avatars.ts";

const props = defineProps<{
  avatarIds: number[];
}>();

const httpClient = inject(httpInjectionKey)!;

const guildAvatars = ref<UserAvatar[]>([]);

const loadAvatars = async () => {
  if (!props.avatarIds?.length) {
    return;
  }

  const response = await listMyAvatars(httpClient)();

  if (isOk(response)) {
    guildAvatars.value = response.data.filter((av) =>
      props.avatarIds.includes(av.id),
    );
  } else {
    console.error(formatError(response));
  }
};

onMounted(() => {
  loadAvatars();
});
</script>

<style scoped></style>
