<template>
    <tr>
        <td>{{title}} <help-tooltip :tooltip="tooltip"/></td>
        <td class="text-end" :class="{'text-warning': value !== compareValue}">{{valueText}}</td>
    </tr>
</template>

<script setup lang="ts">
import HelpTooltip from '../../../components/HelpTooltip.vue'

const props = defineProps<{
  title: string,
  tooltip: string,
  value: string | number | boolean,
  valueText: string | number,
  compareValue?: string | number | boolean | null,
}>();
</script>

<style scoped>

</style>
