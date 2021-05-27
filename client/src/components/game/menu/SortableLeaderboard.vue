<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <slot name="header"></slot>
        </thead>
        <tbody>
            <tr v-for="value in leaderboard" :key="value._id">
                <slot name="row" v-bind="value"></slot>
            </tr>
        </tbody>
    </table>
</div>
</template>
<script>
export default {
    components: {
    },
    props: {
        header: Object,
        defaultSortingKey: String,
        leaderboard: Array
    },
    data () {
        return {
            sortingKey: this.defaultSortingKey
        }
    }
}
</script>

<style scoped>
</style>