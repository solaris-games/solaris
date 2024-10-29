<template>
  <administration-page title="Recent Users" name="users">
    <loading-spinner :loading="!users"/>

    <div v-if="filteredUsers()">
      <div class="panel panel-default user-element" v-for="user of users" :key="user.username">
        <div class="panel-heading">
          <h5 class="panel-title">
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
          </h5>
        </div>
        <div class="panel-body">
          <p v-if="isAdministrator">Email: {{ user.email }}</p>
          <p v-if="isAdministrator">Email enabled: {{ user.emailEnabled }}</p>
          <p v-if="isAdministrator">Last seen: {{ getLastSeenString(user.lastSeen) }}</p>
          <p v-if="isAdministrator" :class="{'text-warning':getDuplicateIPs(user).length}">Last seen IP:
            {{ user.lastSeenIP }}</p>

          <p>
            Established Player: {{ user.isEstablishedPlayer }}

            <i v-if="isCommunityManager && !user.isEstablishedPlayer" class="fas fa-user-check clickable text-danger"
               @click="promoteToEstablishedPlayer(user)" title="Promote to Established Player"></i>

            <i v-if="user.isEstablishedPlayer" class="fas fa-user-check clickable text-success"></i>
          </p>

          <p v-if="isAdministrator">
            <i :style="[user.credits <= 0 ? { 'visibility': 'hidden' } : { 'visibility': 'unset' }]"
               class="fas fa-minus clickable text-danger" @click="setCredits(user, user.credits - 1)"
               title="Deduct Credits"></i>
            {{ user.credits }}
            <i class="fas fa-plus clickable text-success" @click="setCredits(user, user.credits + 1)"
               title="Add Credits"></i>
          </p>

          <div v-if="user.warnings && user.warnings.length">
            <ul class="list-group">
              <li v-for="warning of user.warnings" class="list-group-item">
                <p class="text-warning">{{ warning.date }}: {{ warning.text }}</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="panel-footer">
          <div class="actions">
            <i v-if="isCommunityManager && user._id !== $store.state.userId" class="fas fa-hammer clickable text-danger" :class="{'disabled-role':!user.banned}"
               @click="toggleBan(user)" title="Toggle Banned"></i>
            <i v-if="isAdministrator" class="fas fa-eraser clickable text-warning ms-1" @click="resetAchievements(user)"
               title="Reset Achievements"></i>
            <i v-if="isAdministrator && user._id !== $store.state.userId && !$store.state.isImpersonating" class="fas fa-user clickable text-info ms-1" @click="impersonate(user._id)"
               title="Impersonate User"></i>

            <add-warning v-if="isCommunityManager" :user-id="user._id" @onUserChanged="update"/>
          </div>
        </div>
      </div>
    </div>
  </administration-page>
</template>

<script>
import AdminApiService from "../../services/api/admin";
import moment from "moment/moment";
import router from "../../router";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AddWarning from "./components/AddWarning.vue";
import AdministrationPage from "./AdministrationPage.vue";

export default {
  name: "Users",
  components: {
    'administration-page': AdministrationPage,
    'loading-spinner': LoadingSpinner,
    'add-warning': AddWarning
  },
  data() {
    return {
      filterUser: null,
      filterType: '_id',
      users: null,
      selectedWarningKind: null
    }
  },
  async mounted() {
    await this.update();
  },
  methods: {
    async update () {
      this.filterUser = this.$route.query?.userId;
      this.users = await this.filteredUsers();
    },
    async filteredUsers() {
      const users = await this.getUsers();

      if (!this.filterUser || !this.filterType) {
        return users;
      }

      const filterF = (user) => {
        return user._id === this.filterUser;
      };

      return users.filter((user) => filterF(user));
    },
    async getUsers() {
      const resp = await AdminApiService.getUsers();
      if (resp.status !== 200) {
        this.$toast.error(resp.data);
        return null;
      }

      return resp.data;
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

        await AdminApiService.promoteToEstablishedPlayer(user._id);

        await this.update();
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
          this.$store.commit('setIsImpersonating', response.data.isImpersonating)
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

        await request;

        if (user._id === this.$store.state.userId) {
          this.$store.commit('setRoles', user.roles);
        }

        await this.update();
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

        let response = await AdminApiService.setCredits(user._id, credits);

        if (user._id === this.$store.state.userId) {
          this.$store.commit('setUserCredits', response.data.credits);
        }
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
    isCommunityManager() {
      return this.$store.state.roles.communityManager
    },
  }
}
</script>

<style scoped>
.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, .3);
  padding-top: 8px;
}

.user-element {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, .3);
  margin: 8px;
  padding: 8px;
}

.user-element p {
  margin-bottom: 2px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: start;
}

.disabled-role {
  opacity: 0.2
}

.clickable {
  cursor: pointer;
}
</style>
