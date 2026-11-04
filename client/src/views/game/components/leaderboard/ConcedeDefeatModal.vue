<template>
  <div
    class="modal fade"
    id="concedeDefeat"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalLabel">Concede Defeat</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            :disabled="isConceding"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to concede in this game?</p>
          <p>Do you want to open your slot for another player to fill?</p>
        </div>
        <div class="modal-footer">
          <button
            @click="onCancel"
            type="button"
            class="btn btn-outline-danger ps-3 pe-3"
            data-bs-dismiss="modal"
            :disabled="isConceding"
          >
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button
            @click="onConcede(false)"
            type="button"
            class="btn btn-danger ps-3 pe-3"
            data-bs-dismiss="modal"
            :disabled="isConceding"
          >
            <i class="fas fa-skull-crossbones"></i>
            Concede
          </button>
          <button
            @click="onConcede(true)"
            type="button"
            class="btn btn-success ps-3 pe-3"
            data-bs-dismiss="modal"
            :disabled="isConceding"
          >
            <i class="fas fa-door-open"></i>
            Concede + Open Slot
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useConcedeGame } from "@/hooks/useConcedeGame.ts";

const emit = defineEmits<{
  onConcedeCompleted: [];
  onCancelled: [];
}>();

const { isConceding, concede } = useConcedeGame();

const modal = ref(null);

const onCancel = () => emit("onCancelled");

const onConcede = async (openSlot: boolean) => {
  await concede(openSlot, false);

  emit("onConcedeCompleted");
};

onMounted(() => {
  const modalEl = document.getElementById("concedeDefeat")!;

  modalEl.addEventListener("hidden.bs.modal", () => {
    if (!isConceding.value) {
      emit("onCancelled");
    }
  });

  // @ts-ignore
  modal.value = new bootstrap.Modal(modalEl);
  // @ts-ignore
  modal.value.show();
});
</script>

<style scoped></style>
