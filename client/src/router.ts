import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./views/Home.vue";
import MainMenu from "./views/MainMenu.vue";

// Every route below this point is lazy-loaded. None of the component code
// (or their transitive dependencies, e.g. Chart.js) will be included in the
// initial bundle — it is only downloaded when the user first navigates to
// that route.

// Game is lazy-loaded so that the heavy @solaris/map-rendering / Pixi bundle
// is only downloaded when the user actually enters a game.
const Game = () => import("./views/game/Game.vue");

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/account/achievements/:userId",
      name: "account-achievements",
      component: () => import("./views/account/Achievements.vue"),
    },
    {
      path: "/account/create",
      name: "account-creation",
      component: () => import("./views/account/Creation.vue"),
    },
    {
      path: "/account/forgot-password",
      name: "account-forgot-password",
      component: () => import("./views/account/ForgotPassword.vue"),
    },
    {
      path: "/account/forgot-username",
      name: "account-forgot-username",
      component: () => import("./views/account/ForgotUsername.vue"),
    },
    {
      path: "/account/reset-email",
      name: "account-reset-email",
      component: () => import("./views/account/ResetEmail.vue"),
    },
    {
      path: "/account/reset-username",
      name: "account-reset-username",
      component: () => import("./views/account/ResetUsername.vue"),
    },
    {
      path: "/account/reset-password",
      name: "account-reset-password",
      component: () => import("./views/account/ResetPassword.vue"),
    },
    {
      path: "/account/reset-password-external",
      name: "account-reset-password-external",
      component: () => import("./views/account/ExternalResetPassword.vue"),
    },
    {
      path: "/account/settings",
      name: "account-settings",
      component: () => import("./views/account/Settings.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: Game,
    },
    {
      path: "/game/active-games",
      name: "game-active-games",
      component: () => import("./views/game/ActiveGames.vue"),
    },
    {
      path: "/game/create",
      name: "game-creation",
      component: () => import("./views/game/Create.vue"),
    },
    {
      path: "/game/detail",
      name: "game-detail",
      component: () => import("./views/game/Detail.vue"),
    },
    {
      path: "/game/list",
      name: "game-list",
      component: () => import("./views/game/List.vue"),
    },
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/main-menu",
      name: "main-menu",
      component: MainMenu,
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: () => import("./views/game/Leaderboard.vue"),
    },
    {
      path: "/guild/create",
      name: "guild-create",
      component: () => import("./views/guild/Create.vue"),
    },
    {
      path: "/guild/rename",
      name: "guild-rename",
      component: () => import("./views/guild/Rename.vue"),
    },
    {
      path: "/guild",
      name: "guild",
      component: () => import("./views/guild/MyGuild.vue"),
    },
    {
      path: "/guild/details/:guildId",
      name: "guild-details",
      component: () => import("./views/guild/Detail.vue"),
    },
    {
      path: "/administration/announcements",
      name: "administration-announcements",
      component: () => import("./views/admin/Announcements.vue"),
    },
    {
      path: "/administration/games",
      name: "administration-games",
      component: () => import("./views/admin/Games.vue"),
    },
    {
      path: "/administration/users",
      name: "administration-users",
      component: () => import("./views/admin/Users.vue"),
    },
    {
      path: "/administration/reports",
      name: "administration-reports",
      component: () => import("./views/admin/Reports.vue"),
    },
    {
      path: "/administration/insights",
      name: "administration-insights",
      component: () => import("./views/admin/Insights.vue"),
    },
    {
      path: "/administration/passwordresets",
      name: "administration-password-resets",
      component: () => import("./views/admin/PasswordResets.vue"),
    },
    {
      path: "/avatars",
      name: "avatars",
      component: () => import("./views/shop/Avatars.vue"),
    },
    {
      path: "/shop",
      name: "galactic-credits-shop",
      component: () => import("./views/shop/GalacticCredits.vue"),
    },
    {
      path: "/shop/paymentcomplete",
      name: "galactic-credits-shop-payment-complete",
      component: () => import("./views/shop/PurchaseComplete.vue"),
    },
    {
      path: "/shop/paymentfailed",
      name: "galactic-credits-shop-payment-failed",
      component: () => import("./views/shop/PurchaseFailed.vue"),
    },
    {
      path: "/privacypolicy",
      name: "privacy-policy",
      component: () => import("./views/PrivacyPolicy.vue"),
    },
    {
      path: "/guidelines",
      name: "guidelines",
      component: () => import("./views/CommunityGuidelines.vue"),
    },
    {
      path: "/announcements",
      name: "announcements",
      component: () => import("./views/Announcements.vue"),
    },
  ],
});
