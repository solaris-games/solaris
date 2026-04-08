<template>
  <sortable-leaderboard :leaderboard="members" :sortingKey="sortingKey" @sortingRequested="sortMemberList">
    <template v-slot:header="actions">
      <th style="width: 35%">Player</th>
      <th style="width: 15%" class="sortable-header" title="Role" @click="actions.sort('role')" :class="actions.getColumnClass('role')">
        Role
        <i v-if="actions.isActive('role')" class="fas fa-chevron-down"></i>
      </th>
      <th style="width: 15%" class="text-end sortable-header" title="Rank" @click="actions.sort('rank')" :class="actions.getColumnClass('rank')">
        <i v-if="actions.isActive('rank')" class="fas fa-chevron-down"></i>
        <i class="fas fa-star text-info"></i>
      </th>
      <th style="width: 10%" class="text-end sortable-header" title="Victories" @click="actions.sort('victories')" :class="actions.getColumnClass('victories')">
        <i v-if="actions.isActive('victories')" class="fas fa-chevron-down"></i>
        <i class="fas fa-trophy text-warning"></i>
      </th>
      <th style="width: 10%" class="text-end sortable-header" title="Renown" @click="actions.sort('renown')" :class="actions.getColumnClass('renown')">
        <i v-if="actions.isActive('renown')" class="fas fa-chevron-down"></i>
        <i class="fas fa-heart text-danger"></i>
      </th>
      <th v-if="isInGuild"></th>
    </template>
    <template v-slot:row="{ value, getColumnClass }">
      <slot v-bind="{ value, getColumnClass, sortingKey }"></slot>
    </template>
  </sortable-leaderboard>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SortableLeaderboard from '../../game/components/menu/SortableLeaderboard.vue';
import GameHelper from '../../../services/gameHelper';
import {type GuildWithUsers, type UserPublic} from "@solaris-common";
import { useUserStore } from '@/stores/user';

export type GuildRole = 'leader' | 'officer' | 'member' | 'invitee' | 'applicant';

type SortingKey = 'role' | 'rank' | 'victories' | 'renown';

export interface GuildUser<ID> extends UserPublic<ID> {
  role: GuildRole;
}

const props = defineProps<{
  guild: GuildWithUsers<string>,
}>();

const userStore = useUserStore();

const sortingKey = ref<SortingKey>('role');
const members = ref<GuildUser<string>[]>([]);

const isInGuild = computed(() => GameHelper.isInGuild(props.guild, userStore.userId));

const roleToValue = (role: GuildRole) => {
  if (role === 'leader') {
    return 3;
  } else if (role === 'officer') {
    return 2;
  } else if (role === 'member') {
    return 1;
  } else {
    return 0;
  }
};

const getComparer = (key: string) => {
  if (key === 'role') {
    return (u1: GuildUser<string>, u2: GuildUser<string>) => roleToValue(u2.role) - roleToValue(u1.role);
  } else if (key === 'rank') {
    return (u1: GuildUser<string>, u2: GuildUser<string>) => u2.achievements.rank - u1.achievements.rank;
  } else if (key === 'victories') {
    return (u1: GuildUser<string>, u2: GuildUser<string>) => u2.achievements.victories - u1.achievements.victories;
  } else if (key === 'renown') {
    return (u1: GuildUser<string>, u2: GuildUser<string>) => u2.achievements.renown - u1.achievements.renown;
  } else {
    return (a: GuildUser<string>, b: GuildUser<string>) => 0;
  }
};

const sortMemberList = (key: SortingKey) => {
  sortingKey.value = key;
  const comparer = getComparer(key);
  members.value.sort(comparer);
};

onMounted(() => {
  if (props.guild.leader) {
    members.value.push({
      role: 'leader',
      ...props.guild.leader,
    });
  }

  if (props.guild.officers) {
    props.guild.officers.forEach(officer => {
      members.value.push({
        role: 'officer',
        ...officer,
      });
    });
  }

  if (props.guild.members) {
    props.guild.members.forEach(member => {
      members.value.push({
        role: 'member',
        ...member,
      });
    });
  }

  if (props.guild.invitees) {
    props.guild.invitees.forEach(invitee => {
      members.value.push({
        role: 'invitee',
        ...invitee,
      });
    });
  }

  if (props.guild.applicants) {
    props.guild.applicants.forEach(applicant => {
      members.value.push({
        role: 'applicant',
        ...applicant,
      });
    });
  }
});
</script>
<style scoped>
</style>
