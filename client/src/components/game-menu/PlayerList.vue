<template>
    <ul class="list-group list-group-horizontal">
        <li class="list-group-item" v-for="p in players" v-bind:key="p._id">
            <img src="../../assets/avatars/0.jpg">

            <div class="colour-bar" v-bind:style="{'background-color':getFriendlyColour(p.colour.value)}">
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        players: Array
    },
    methods: {
        getFriendlyColour(colour) {
            return colour.replace('0x', '#');
        }
    }
}
</script>

<style scoped>
img {
    width: 60px;
    height: 60px;
}

.list-group-item {
    padding: 0;
    border: 0;
}

.colour-bar {
    min-height: 8px;
    min-width: 60px;
}
</style>
