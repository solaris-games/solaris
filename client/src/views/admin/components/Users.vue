<template>
  <div>
    <loading-spinner :loading="!users"/>

    <div v-if="users">
      <h4 class="mb-1">Recent Users</h4>
      <ul>
        <li v-for="user of users">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h3 class="panel-title">
                {{ user.username }}
                <span v-if="isAdministrator">
                  <i class="fas fa-hands-helping clickable" :class="{'disabled-role':!user.roles.contributor}"
                     @click="toggleRole(user, 'contributor')" title="Toggle Contributor Role"></i>
                  <i class="fas fa-code ms-1 clickable" :class="{'disabled-role':!user.roles.developer}"
                     @click="toggleRole(user, 'developer')" title="Toggle Developer Role"></i>
                  <i class="fas fa-user-friends ms-1 clickable" :class="{'disabled-role':!user.roles.communityManager}"
                     @click="toggleRole(user, 'communityManager')" title="Toggle Community Manager Role"></i>
                  <i class="fas fa-dice ms-1 clickable" :class="{'disabled-role':!user.roles.gameMaster}"
                      @click="toggleRole(user, 'gameMaster')" title="Toggle Game Master Role"></i>
                </span>
              </h3>
            </div>
            <div class="panel-body">
              <p v-if="isAdministrator">Email: {{ user.email }}</p>
              <p v-if="isAdministrator">Email enabled: {{ user.emailEnabled }}</p>
              <p v-if="isAdministrator" :class="{'text-warning':getDuplicateIPs(user).length}">Last seen: {{ getLastSeenString(user.lastSeen) }}</p>
              <p v-if="isAdministrator">Last seen IP: {{ user.lastSeenIP }}</p>

              <p v-if="isAdministrator">
                <i class="fas fa-minus clickable text-danger" @click="setCredits(user, user.credits - 1)"
                   title="Deduct Credits"></i>
                {{ user.credits }}
                <i class="fas fa-plus clickable text-success" @click="setCredits(user, user.credits + 1)"
                   title="Add Credits"></i>
              </p>

              <div v-if="user.warnings && user.warnings.length">
                <ul class="list-group">
                  <li v-for="warning of user.warnings">
                    <p>{{ warning.date }}: {{ toDescription(warning.kind) }}</p>
                  </li>
                </ul>
              </div>
            </div>
            <div class="panel-footer">
              <i class="fas fa-hammer clickable text-danger" :class="{'disabled-role':!user.banned}"
                 @click="toggleBan(user)" title="Toggle Banned"></i>
              <i class="fas fa-eraser clickable text-warning ms-1" @click="resetAchievements(user)"
                 title="Reset Achievements"></i>
              <i class="fas fa-user clickable text-info ms-1" @click="impersonate(user._id)" title="Impersonate User"></i>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AdminApiService from "../../../services/api/admin";
import moment from "moment/moment";
import router from "../../../router";
import LoadingSpinner from "../../components/LoadingSpinner.vue";

export default {
  name: "Users",
  components: {
    'loading-spinner': LoadingSpinner
  },
  data() {
    return {
      users: null
    }
  },
  async mounted() {
    this.users = await this.getUsers();
  },
  methods: {
    async getUsers() {
      const resp = await AdminApiService.getUsers();
      if (resp.status !== 200) {
        this.$toasted.error(resp.data);
        return null;
      }
      return resp.data;
    },
    toDescription(warningKind) {
      switch (warningKind) {
        case 'afk':
          return 'frequent inactivity'
        case 'cheating':
          return 'cheating'
        case 'abusive':
          return 'abusive behaviour'
        case 'other':
          return 'other'
      }
    },
    getLastSeenString(lastSeen) {
      if (!lastSeen) {
        return ''
      }

      return moment(lastSeen).utc().fromNow()
    },
    getDuplicateIPs(user) {
      return this.users.filter(x => x._id !== user._id && x.lastSeenIP && x.lastSeenIP === user.lastSeenIP).map(x => x.username)
    },
    async promoteToEstablishedPlayer(user) {
      if (user.isEstablishedPlayer) {
        return
      }

      if (!await this.$confirm('Promote to Established Player', 'Are you sure you want to promote this player to an established player?')) {
        return
      }

      try {
        user.isEstablishedPlayer = true

        await AdminApiService.promoteToEstablishedPlayer(user._id)
      } catch (err) {
        console.error(err)
      }
    },
    async impersonate(userId) {
      try {
        let response = await AdminApiService.impersonate(userId)

        if (response.status === 200) {
          this.$store.commit('setUserId', response.data._id)
          this.$store.commit('setUsername', response.data.username)
          this.$store.commit('setRoles', response.data.roles)
          this.$store.commit('setUserCredits', response.data.credits)
        }

        router.push({name: 'home'})
      } catch (err) {
        console.error(err)
      }
    },
    async toggleRole(user, role) {
      try {
        user.roles[role] = !user.roles[role]

        let request;

        switch (role) {
          case 'contributor':
            request = AdminApiService.setRoleContributor(user._id, user.roles.contributor)
            break
          case 'developer':
            request = AdminApiService.setRoleDeveloper(user._id, user.roles.developer)
            break
          case 'communityManager':
            request = AdminApiService.setRoleCommunityManager(user._id, user.roles.communityManager)
            break
          case 'gameMaster':
            request = AdminApiService.setRoleGameMaster(user._id, user.roles.gameMaster)
            break
        }

        await request
      } catch (err) {
        console.error(err)
      }
    },
    async resetAchievements(user) {
      if (!await this.$confirm('Reset Achievements', 'Are you sure you want to reset this players achievements?')) {
        return
      }

      try {
        await AdminApiService.resetAchievements(user._id)
      } catch (err) {
        console.error(err)
      }
    },
    async setCredits(user, credits) {
      try {
        user.credits = Math.max(credits, 0)

        await AdminApiService.setCredits(user._id, credits)
      } catch (err) {
        console.error(err)
      }
    },
    async toggleBan(user) {
      if (!await this.$confirm('Ban/Unban', 'Are you sure you want to ban/unban this player?')) {
        return
      }

      try {
        user.banned = !user.banned

        if (user.banned) {
          await AdminApiService.ban(user._id)
        } else {
          await AdminApiService.unban(user._id)
        }
      } catch (err) {
        console.error(err)
      }
    },
  },
  computed: {
    isAdministrator() {
      return this.$store.state.roles.administrator
    },
  }
}
</script>

<style scoped>

</style>
