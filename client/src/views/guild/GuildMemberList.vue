<template>
  <sortable-leaderboard :leaderboard="members" :sortingKey="sortingKey">
    <template v-slot:header="actions">
      <th>Player</th>
      <th>Role</th>
      <th class="text-right" title="Rank">
        <i class="fas fa-star text-info"></i>
      </th>
      <th class="text-right" title="Victories">
        <i class="fas fa-trophy text-warning"></i>
      </th>
      <th class="text-right" title="Renown">
        <i class="fas fa-heart text-danger"></i>
      </th>
      <th></th>
    </template>
    <template v-slot:row="{ value, getColumnClass }">
      <slot v-bind="{ value, getColumnClass }"></slot>
    </template>
  </sortable-leaderboard>
</template>
<script>
import SortableLeaderboard from '../../components/game/menu/SortableLeaderboard';

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

    console.log(this.members);
  },
};
</script>
<style scoped>
</style>