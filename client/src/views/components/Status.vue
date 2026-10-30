<template>
  <div
    class="modal fade"
    id="errorStatusModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalLabel">Solaris Status</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            @click="onIgnore"
          ></button>
        </div>
        <div class="modal-body">
          <p>Solaris is currently down for maintenance.</p>
          <p>We'll be back soon!</p>
          <p>
            Maybe check out the
            <a href="https://discord.com/invite/v7PD33d" target="_blank"
              >Discord</a
            >
            in the meantime!
          </p>
          <p>
            <span class="fw-bold">Ignore</span> to continue using the page
            (functionality may be interrupted).
          </p>
          <p><span class="fw-bold">Reload</span> to reload the page.</p>
        </div>
        <div class="modal-footer">
          <button
            @click="onIgnore"
            type="button"
            class="btn btn-outline-primary ps-3 pe-3"
            data-bs-dismiss="modal"
          >
            Ignore
          </button>
          <button
            @click="onReload"
            type="button"
            class="btn btn-success ps-3 pe-3"
            data-bs-dismiss="modal"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from "vue";
import { eventBusInjectionKey } from "@/eventBus.ts";
import StateEventBusEventNames from "@/eventBusEventNames/state.ts";

declare var bootstrap: any;

const eventBus = inject(eventBusInjectionKey)!;

let isIgnored = false;

const modal = ref<any>(null);

const onErrorReceived = () => {
  if (isIgnored) {
    return;
  }

  modal.value?.show();
};

const onIgnore = () => {
  isIgnored = true;
};

const onReload = () => {
  window.location.reload();
};

onMounted(() => {
  const modalElement: HTMLElement =
    document.getElementById("errorStatusModal")!;

  modal.value = new bootstrap.Modal(modalElement, {});

  eventBus.on(
    StateEventBusEventNames.BackendDownErrorReceived,
    onErrorReceived,
  );
});

onUnmounted(() => {
  modal.value?.dispose();

  eventBus.off(
    StateEventBusEventNames.BackendDownErrorReceived,
    onErrorReceived,
  );
});
</script>
<style scoped></style>
