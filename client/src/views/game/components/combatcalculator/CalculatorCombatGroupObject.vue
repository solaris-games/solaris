<template>
  <div class="cg-group-object p-2">
    <div class="cg-group-object-header mb-1">
      <span>
        <slot name="icon"></slot>
      </span>
      <div>
        <slot name="header"></slot>
        <button class="btn btn-sm btn-danger" @click="remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <slot name="inputs"></slot>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<{ onRemove: [] }>();

const remove = () => emit("onRemove");
</script>
<style scoped>
.cg-group-object {
  display: flex;
  flex-direction: column;
  border: 1px white solid;
  border-radius: 4px;
  flex-basis: 160px;
  flex-grow: 1;
  max-width: 220px;
}

.cg-group-object-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
