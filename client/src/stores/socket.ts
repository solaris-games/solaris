import { ref, readonly } from 'vue';
import { defineStore } from "pinia";

export const useSocketStore = defineStore('socket', () => {
  const socketConnected = ref(false);

  const setSocketConnected = (v: boolean) => {
    socketConnected.value = v;
  };

  return {
    socketConnected: readonly(socketConnected),
    setSocketConnected,
  };
});
