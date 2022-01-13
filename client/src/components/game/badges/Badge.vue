<template>
    <div class="badge-container" @click="onOpenPurchasePlayerBadgeRequested">
        <img :src="require(`../../../assets/badges/${badge.key}.png`)" :title="badge.name"/>
        <span class="badge-label" :title="badge.name">{{badge.awarded}}</span>
    </div>
</template>

<script>
export default {
  props: {
    badge: Object
  },
  methods: {
    onOpenPurchasePlayerBadgeRequested () {
        this.$emit('onOpenPurchasePlayerBadgeRequested')
    }
  }
}
</script>

<style scoped>
img {
    width: 110px;
    height: 110px;
}

@media screen and (max-width: 576px) {
    img {
        width: 95px;
        height: 95px;
    }
}

.badge-container {
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.badge-label {
    position: absolute;
    right: 8px;
    top: 8px;
    font-size: 20px;
    background: #e74c3c;
    padding: 0px 8px;
    border-radius: 5px;
}
</style>
