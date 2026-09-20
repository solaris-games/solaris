<template>
  <div v-if="!isLoading">
    <div class="avatar-container">
      <picture class="avatar-image" v-if="avatar != null">
        <source :srcset="getAvatarWebpImage(avatar)" type="image/webp" />
        <img :src="getAvatarImage(avatar)" width="128" height="128" />
      </picture>
      <span v-if="avatar == null" class="select-avatar-warning text-warning">
        Select an avatar
      </span>
      <span v-if="avatar && !avatar.unlocked" class="select-avatar-locked">
        <i class="fas fa-lock"></i>
      </span>
    </div>

    <div class="row mt-1 mb-1">
      <div class="col pe-0 ps-0">
        <button class="btn btn-primary" @click="prevAvatar()">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      <div class="col-auto pe-0 ps-0">
        <button class="btn btn-primary" @click="nextAvatar()">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-12 pe-0 ps-0 mt-1 mb-1">
        <div class="d-grid gap-2">
          <router-link :to="{ name: 'avatars' }" class="btn btn-sm btn-success">
            <i class="fas fa-shopping-cart"></i> Shop
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, inject, onMounted } from "vue";
import { sorterByProperty, type UserAvatar } from "@solaris/common";
import { formatError, httpInjectionKey, isOk } from "@/services/typedapi";
import { listMyAvatars } from "@/services/typedapi/user";
import {
  getAvatarImage,
  getAvatarWebpImage,
} from "@/views/game/components/avatar/avatars.ts";

const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  onAvatarChanged: [avatar: UserAvatar];
}>();

const isLoading = ref(false);
const avatar: Ref<UserAvatar | null> = ref(null);
const avatars: Ref<UserAvatar[]> = ref([]);

const reloadAvatars = async () => {
  isLoading.value = true;

  const response = await listMyAvatars(httpClient)();

  if (isOk(response)) {
    const purchased = response.data.filter((a) => a.unlocked);
    const notPurchased = response.data.filter((a) => !a.unlocked);

    const sorter = sorterByProperty("id");

    avatars.value = purchased.sort(sorter).concat(notPurchased.sort(sorter));
    console.log(avatars.value);
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const onAvatarChanged = () => {
  emit("onAvatarChanged", avatar.value!);
};

const nextAvatar = () => {
  if (!avatar.value) {
    avatar.value = avatars.value[0];
  } else {
    let currentIndex = avatars.value.indexOf(avatar.value);

    currentIndex++;

    if (currentIndex > avatars.value.length - 1) {
      currentIndex = 0;
    }

    avatar.value = avatars.value[currentIndex];
  }

  onAvatarChanged();
};

const prevAvatar = () => {
  if (!avatar.value) {
    avatar.value = avatars.value[avatars.value.length - 1];
  } else {
    let currentIndex = avatars.value.indexOf(avatar.value);

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = avatars.value.length - 1;
    }

    avatar.value = avatars.value[currentIndex];
  }

  onAvatarChanged();
};

onMounted(async () => {
  await reloadAvatars();
});
</script>

<style scoped>
.avatar-container {
  display: grid;
  grid-template-areas: "a";
  width: 128px;
  height: 128px;
}

.avatar-image {
  grid-area: a;
  width: 128px;
  height: 128px;
}

.select-avatar-warning {
  width: 128px;
  height: 128px;
  grid-area: a;
  border: 3px dashed #fff;
  text-align: center;
  vertical-align: center;
  padding-top: 24px;
}

.select-avatar-locked {
  padding-top: 24px;
  width: 128px;
  height: 128px;
  grid-area: a;
  font-size: 55px;
  text-align: center;
  vertical-align: center;
  color: white;
}
</style>
