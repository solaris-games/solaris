<template>
  <view-container :is-auth-page="true">
    <view-title title="Processing Payment" />

    <loading-spinner :loading="true" />
    <p class="text-center">Your payment is being processed...</p>
  </view-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ViewTitle from "../components/ViewTitle.vue";
import ViewContainer from "../components/ViewContainer.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import { processGalacticCredits } from "@solaris/api-client/shopPurchase";
import { formatError, isOk } from "@solaris/api-client";
import { httpInjectionKey } from "@/services/http";
import { inject } from "vue";

const route = useRoute();
const router = useRouter();
const httpClient = inject(httpInjectionKey)!;

const processPayment = async (token: string) => {
  const response = await processGalacticCredits(httpClient)(token);

  if (isOk(response)) {
    await router.replace({
      name: "galactic-credits-shop-payment-complete",
      query: { credits: response.data.credits.toString() },
    });
  } else {
    console.error(formatError(response));

    await router.replace({ name: "galactic-credits-shop-payment-failed" });
  }
};

onMounted(async () => {
  const token = route.query.token;

  if (typeof token !== "string" || !token.length) {
    await router.replace({ name: "galactic-credits-shop-payment-failed" });
    return;
  }

  await processPayment(token);
});
</script>

<style scoped></style>
