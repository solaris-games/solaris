import Vue from 'vue'
import Router from 'vue-router'
import AccountAchievements from './views/AccountAchievements.vue'
import AccountCreation from './views/AccountCreation.vue'
import AccountForgotPassword from './views/AccountForgotPassword.vue'
import AccountForgotUsername from './views/AccountForgotUsername.vue'
import AccountResetEmail from './views/AccountResetEmail.vue'
import AccountResetUsername from './views/AccountResetUsername.vue'
import AccountResetPassword from './views/AccountResetPassword.vue'
import AccountExternalResetPassword from './views/AccountExternalResetPassword.vue'
import AccountSettings from './views/AccountSettings.vue'
import Codex from './views/Codex.vue'
import Game from './views/Game.vue'
import GameActiveGames from './views/GameActiveGames.vue'
import GameCreation from './views/GameCreation.vue'
import GameDetail from './views/GameDetail.vue'
import GameList from './views/GameList.vue'
import Home from './views/Home.vue'
import MainMenu from './views/MainMenu.vue'
import PremiumStore from './views/PremiumStore.vue'
import Leaderboard from './views/Leaderboard.vue'
import Guild from './views/guild/Guild.vue'
import GuildCreate from './views/guild/GuildCreate.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/account/achievements/:userId',
      name: 'account-achievements',
      component: AccountAchievements
    },
    {
      path: '/account/create',
      name: 'account-creation',
      component: AccountCreation
    },
    {
      path: '/account/forgot-password',
      name: 'account-forgot-password',
      component: AccountForgotPassword
    },
    {
      path: '/account/forgot-username',
      name: 'account-forgot-username',
      component: AccountForgotUsername
    },
    {
      path: '/account/reset-email',
      name: 'account-reset-email',
      component: AccountResetEmail
    },
    {
      path: '/account/reset-username',
      name: 'account-reset-username',
      component: AccountResetUsername
    },
    {
      path: '/account/reset-password',
      name: 'account-reset-password',
      component: AccountResetPassword
    },
    {
      path: '/account/reset-password-external',
      name: 'account-reset-password-external',
      component: AccountExternalResetPassword
    },
    {
      path: '/account/settings',
      name: 'account-settings',
      component: AccountSettings
    },
    {
      path: '/codex',
      name: 'codex',
      component: Codex
    },
    {
      path: '/game',
      name: 'game',
      component: Game
    },
    {
      path: '/game/active-games',
      name: 'game-active-games',
      component: GameActiveGames
    },
    {
      path: '/game/create',
      name: 'game-creation',
      component: GameCreation
    },
    {
      path: '/game/detail',
      name: 'game-detail',
      component: GameDetail
    },
    {
      path: '/game/list',
      name: 'game-list',
      component: GameList
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/main-menu',
      name: 'main-menu',
      component: MainMenu
    },
    {
      path: '/premium-store',
      name: 'premium-store',
      component: PremiumStore
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: Leaderboard
    },
    {
      path: '/guild/create',
      name: 'guild-create',
      component: GuildCreate
    },
    {
      path: '/guild',
      name: 'guild',
      component: Guild
    }
  ]
})
