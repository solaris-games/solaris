import {createRouter, createWebHashHistory} from 'vue-router'
import Home from './views/Home.vue'
import MainMenu from './views/MainMenu.vue'
import PrivacyPolicy from './views/PrivacyPolicy.vue'
import AccountAchievements from './views/account/Achievements.vue'
import AccountCreation from './views/account/Creation.vue'
import AccountForgotPassword from './views/account/ForgotPassword.vue'
import AccountForgotUsername from './views/account/ForgotUsername.vue'
import AccountResetEmail from './views/account/ResetEmail.vue'
import AccountResetUsername from './views/account/ResetUsername.vue'
import AccountResetPassword from './views/account/ResetPassword.vue'
import AccountExternalResetPassword from './views/account/ExternalResetPassword.vue'
import AccountSettings from './views/account/Settings.vue'
import Game from './views/game/Game.vue'
import GameActiveGames from './views/game/ActiveGames.vue'
import GameCreation from './views/game/Create.vue'
import GameDetail from './views/game/Detail.vue'
import GameList from './views/game/List.vue'
import Leaderboard from './views/game/Leaderboard.vue'
import MyGuild from './views/guild/MyGuild.vue'
import GuildCreate from './views/guild/Create.vue'
import GuildRename from './views/guild/Rename.vue'
import GuildDetails from './views/guild/Detail.vue'
import Avatars from './views/shop/Avatars.vue'
import GalacticCreditsShop from './views/shop/GalacticCredits.vue'
import ShopPurchaseComplete from './views/shop/PurchaseComplete.vue'
import ShopPurchaseFailed from './views/shop/PurchaseFailed.vue'
import Games from "./views/admin/Games.vue";
import Users from "./views/admin/Users.vue";
import Reports from "./views/admin/Reports.vue";
import Insights from "./views/admin/Insights.vue";
import PasswordResets from "./views/admin/PasswordResets.vue";
import CommunityGuidelines from "./views/CommunityGuidelines.vue";
import AdminAnnouncements from './views/admin/Announcements.vue';
import Announcements from "./views/Announcements.vue";

export default createRouter({
  history: createWebHashHistory(),
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
      path: '/guild/rename',
      name: 'guild-rename',
      component: GuildRename
    },
    {
      path: '/guild',
      name: 'guild',
      component: MyGuild
    },
    {

      path: '/guild/details/:guildId',
      name: 'guild-details',
      component: GuildDetails
    },
    {
      path: '/administration/announcements',
      name: 'administration-announcements',
      component: AdminAnnouncements
    },
    {
      path: '/administration/games',
      name: 'administration-games',
      component: Games
    },
    {
      path: '/administration/users',
      name: 'administration-users',
      component: Users
    },
    {
      path: '/administration/reports',
      name: 'administration-reports',
      component: Reports
    },
    {
      path: '/administration/insights',
      name: 'administration-insights',
      component: Insights
    },
    {
      path: '/administration/passwordresets',
      name: 'administration-password-resets',
      component: PasswordResets
    },
    {
      path: '/avatars',
      name: 'avatars',
      component: Avatars
    },
    {
      path: '/shop',
      name: 'galactic-credits-shop',
      component: GalacticCreditsShop
    },
    {
      path: '/shop/paymentcomplete',
      name: 'galactic-credits-shop-payment-complete',
      component: ShopPurchaseComplete
    },
    {
      path: '/shop/paymentfailed',
      name: 'galactic-credits-shop-payment-failed',
      component: ShopPurchaseFailed
    },
    {
      path: '/privacypolicy',
      name: 'privacy-policy',
      component: PrivacyPolicy
    },
    {
      path: '/guidelines',
      name: 'guidelines',
      component: CommunityGuidelines
    },
    {
      path: '/announcements',
      name: 'announcements',
      component: Announcements
    }
  ]
})
