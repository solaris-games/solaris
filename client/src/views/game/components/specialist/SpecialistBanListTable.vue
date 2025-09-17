<template>
    <table class="table table-sm table-striped">
        <thead class="table-dark">
          <tr>
            <th class="col-1"></th>
            <th class="col-8">Name</th>
            <th class="col-1"></th>
            <th class="col-auto text-end">Banned</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="specialist in specialists" :key="specialist.id">
                <td>
                    <specialist-icon :type="specialistType" :defaultIcon="specialistDefaultIcon" :specialist="specialist"/>
                </td>
                <td>
                    {{specialist.name}}
                </td>
                <td>
                    <help-tooltip :tooltip="specialist.description"/>
                </td>
                <td class="text-end">
                    <div class="form-check float-end" v-if="!readonly">
                        <input class="form-check-input" type="checkbox" :checked="isBanned(specialist)" @change="(e) => changeBanned(specialist, e)">
                    </div>
                    <i class="fas fa-check text-danger" v-if="readonly && isBanned(specialist)"></i>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import type {Specialist} from "@solaris-common";

const props = defineProps<{
  specialists: Specialist[],
  specialistType: 'star' | 'carrier',
  specialistDefaultIcon: string,
  readonly: boolean,
  bans: number[],
}>();

const emit = defineEmits<{
  onBansChanged: [bans: number[]]
}>();

const changeBanned = (specialist: Specialist, e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  const newBans = checked
    ? [...props.bans, specialist.id]
    : props.bans.filter(id => id !== specialist.id);

  emit('onBansChanged', newBans);
}

const isBanned = (specialist: Specialist) => {
  return props.bans.indexOf(specialist.id) > -1;
};
</script>

<style scoped>

</style>
