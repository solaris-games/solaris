<template>
    <loading-spinner :loading="!game"/>

    <div v-if="game">
        <p>{{ game.settings.general.name }}</p>
    </div>
</template>
<script>
export default {
    props: {
        game: Object,
    }
}
</script>
<style scoped>
</style>