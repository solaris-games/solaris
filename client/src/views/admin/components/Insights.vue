<template>
    <table class="table table-striped table-hover" v-if="insights">
        <thead>
            <tr>
                <th></th>
                <th>24h</th>
                <th>48h</th>
                <th>1 Week</th>
                <th>2 Weeks</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="insight of insights" :key="insight.name">
                <td>{{ insight.name }}</td>
                <td>{{ insight.d1 }}</td>
                <td>{{ insight.d2 }}</td>
                <td>{{ insight.d7 }}</td>
                <td>{{ insight.d14 }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import AdminApiService from '../../../services/api/admin'

export default {
    data () {
        return {
            insights: null
        }
    },
    mounted () {
        this.load()
    },
    methods: {
        async load () {
            try {
                let response = await AdminApiService.getInsights()

                if (response.status === 200) {
                    this.insights = response.data
                }
            } catch (err) {
                console.error(err)
            }
        }
    }
}
</script>

<style scoped>

</style>