<template>
  <div>
    <div class="row avatar-container text-center">
      <img v-if="avatar != null" :src="getAvatarImage()" width="128" height="128">
      <p v-if="avatar == null" class="select-avatar-warning text-warning">Select an avatar</p>
      <p v-if="avatar && !avatar.purchased" class="select-avatar-locked"><i class="fas fa-lock"></i></p>
    </div>

    <div class="row mt-1 mb-1">
      <div class="col pe-0 ps-0">
        <button class="btn btn-primary" @click="prevAvatar()"><i class="fas fa-chevron-left"></i></button>
      </div>
      <div class="col-auto pe-0 ps-0">
        <button class="btn btn-primary" @click="nextAvatar()"><i class="fas fa-chevron-right"></i></button>
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
import { ref, type Ref, inject, onMounted } from 'vue';
import { type UserAvatar } from '@solaris-common';
import { httpInjectionKey, isOk } from '@/services/typedapi';
import { listMyAvatars } from '@/services/typedapi/user';

const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  onAvatarChanged: [avatar: UserAvatar],
}>();

const isLoading = ref(false);
const avatar: Ref<UserAvatar | null> = ref(null);
const avatars: Ref<UserAvatar[]> = ref([]);

const reloadAvatars = async () => {
  isLoading.value = true

  try {
    const response = await listMyAvatars(httpClient)();

    if (isOk(response)) {
      avatars.value = response.data.avatars;
    }
  } catch (err) {
    console.error(err)
  }

  isLoading.value = false
};

const onAvatarChanged = () => {
  emit('onAvatarChanged', avatar.value!);
}

const getAvatarImage = () => {
  try {
    return new URL(`../../../../assets/avatars/${avatar.value!.file}`, import.meta.url).href;
  } catch (err) {
    console.error(err);

    return undefined;
  }
}

const nextAvatar = () => {
  if (avatar.value == null) {
    avatar.value = avatars.value.find(a => a.id === 21)!;
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
  if (avatar.value == null) {
    avatar.value = avatars.value.find(a => a.id === 21)!;
  } else {
    let currentIndex = avatars.value.indexOf(avatar.value);

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = avatars.value.length - 1;
    }

    avatar.value = avatars.value[currentIndex];
  }

  onAvatarChanged();
}

onMounted(async () => {
  await reloadAvatars();
});
</script>

<style scoped>
.avatar-container {
  width: 128px;
  height: 128px;
}

.select-avatar-warning {
  display: table-cell;
  width: 128px;
  height: 128px;
  padding: 20px 0px;
  border: 3px dashed #fff;
  vertical-align: middle;
}

.select-avatar-locked {
  display: table-cell;
  width: 128px;
  height: 128px;
  padding: 20px 0px;
  vertical-align: middle;
  position: absolute;
  font-size: 55px;
  opacity: 0.75;
}
</style>
