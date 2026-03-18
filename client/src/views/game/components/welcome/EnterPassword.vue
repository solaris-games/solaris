<template>
<div>
    <div class="row text-center bg-dark">
        <div class="col">
            <p class="mb-0 mt-2 mb-2">Enter the game password to continue.</p>
        </div>
    </div>

    <div class="row bg-dark">
        <div class="col">
            <form @submit.prevent>
                <div class="mb-2 mt-3">
                    <input class="form-control" :required="true" placeholder="Password" type="password" v-model="password" @change="onPasswordChanged">
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const password = ref<string | null>(null);

const emit = defineEmits<{
    onPasswordChanged: [password: string];
}>();

const onPasswordChanged = () => {
    emit('onPasswordChanged', password.value || '');
};
</script>

<style scoped>
</style>
