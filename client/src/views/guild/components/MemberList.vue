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
<script>
import SortableLeaderboard from '../../game/components/menu/SortableLeaderboard.vue';
import GameHelper from '../../../services/gameHelper';

export default {
  components: {
    'sortable-leaderboard': SortableLeaderboard
  },
  props: {
    guild: Object
  },
  data() {
    return {
      members: [],
      sortingKey: 'role'
    };
  },
  mounted() {
    if (this.guild.leader) {
      this.guild.leader.role = 'leader';
      this.members.push(this.guild.leader);
    }

    if (this.guild.officers) {
      this.guild.officers.forEach(officer => {
        officer.role = 'officer';
        this.members.push(officer);
      });
    }

    if (this.guild.members) {
      this.guild.members.forEach(member => {
        member.role = 'member';
        this.members.push(member);
      });
    }

    if (this.guild.invitees) {
      this.guild.invitees.forEach(invitee => {
        invitee.role = 'invitee';
        this.members.push(invitee);
      });
    }

    if (this.guild.applicants) {
      this.guild.applicants.forEach(applicant => {
        applicant.role = 'applicant';
        this.members.push(applicant);
      });
    }
  },
  methods: {
    sortMemberList (key) {
      this.sortingKey = key;
      const comparer = this.getComparer(key);
      this.members.sort(comparer);
    },
    getComparer (key) {
      if (key === 'role') {
        return (u1, u2) => this.roleToValue(u2.role) - this.roleToValue(u1.role);
      } else if (key === 'rank') {
        return (u1, u2) => u2.achievements.rank - u1.achievements.rank;
      } else if (key === 'victories') {
        return (u1, u2) => u2.achievements.victories - u1.achievements.victories;
      } else if (key === 'renown') {
        return (u1, u2) => u2.achievements.renown - u1.achievements.renown;
      } else {
        return (a, b) => 0;
      }
    },
    roleToValue (role) {
      if (role === 'leader') {
        return 3;
      } else if (role === 'officer') {
        return 2;
      } else if (role === 'member') {
        return 1;
      } else {
        return 0;
      }
    }
  },
  computed: {
    isInGuild () {
      return GameHelper.isInGuild(this.guild, this.$store.state.userId)
    }
  }
};
</script>
<style scoped>
</style>
