<template>
    <tr>
        <td>{{title}} <help-tooltip :tooltip="tooltip"/></td>
        <td class="text-end" :class="{'text-warning': value !== compareValue}">{{valueText}}</td>
    </tr>
</template>

<script>
import HelpTooltip from '../../../components/HelpTooltip.vue'

export default {
    components: {
        'help-tooltip': HelpTooltip
    },
    props: {
        title: String,
        tooltip: String,
        valueText: [String, Number],
        value: [String, Number, Boolean],
        compareValue: [String, Number, Boolean]
    }
}
</script>

<style scoped>

</style>
