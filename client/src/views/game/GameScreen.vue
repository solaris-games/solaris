<template>
  <div class="game-grid">
    <header class="game-grid-header">
      <slot name="header"></slot>
    </header>

    <div class="game-grid-content-left">
      <slot name="content-left"></slot>
    </div>

    <div class="game-grid-ui">
      <slot name="content-ui"></slot>
    </div>

    <div class="game-grid-content">
      <slot name="content-game"></slot>
    </div>

    <div class="game-grid-content-right">
      <slot name="content-right"></slot>
    </div>

    <footer class="game-grid-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.game-grid {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "header header header"
    "content-left content content-right"
    "footer footer footer";
}

.game-grid-content-left {
  grid-area: content-left;
}

.game-grid-content-right {
  grid-area: content-right;
}

.game-grid-ui {
  grid-area: content;
}

.game-grid-content {
  grid-area: content;
}

.game-grid-header {
  grid-area: header;
}

.game-grid-footer {
  grid-area: footer;
}
</style>
