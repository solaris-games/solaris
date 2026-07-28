<template>
  <div class="menu-page container">
    <menu-title title="Galaxy" @onCloseRequested="onCloseRequested" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'empires' }"
          data-bs-toggle="tab"
          href="#empires"
          >Empires</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'stars' }"
          data-bs-toggle="tab"
          href="#stars"
          >Stars</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'starTypes' }"
          data-bs-toggle="tab"
          href="#starTypes"
          >Star Types</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'carriers' }"
          data-bs-toggle="tab"
          href="#carriers"
          >Carriers</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'ships' }"
          data-bs-toggle="tab"
          href="#ships"
          >Ships</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'capitals' }"
          data-bs-toggle="tab"
          href="#capitals"
          >Capitals</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'naturalResources' }"
          data-bs-toggle="tab"
          href="#naturalResources"
          >Resources</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'technology' }"
          data-bs-toggle="tab"
          href="#technology"
          >Technology</a
        >
      </li>
    </ul>

    <div class="tab-content pt-2 pb-2">
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'empires' }"
        id="empires"
      >
        <empires-table
          @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'stars' }"
        id="stars"
      >
        <stars-table @onOpenStarDetailRequested="onOpenStarDetailRequested" />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'starTypes' }"
        id="starTypes"
      >
        <star-types-table
          @onOpenStarDetailRequested="onOpenStarDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'carriers' }"
        id="carriers"
      >
        <carriers-table
          @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'ships' }"
        id="ships"
      >
        <ships-table
          @onOpenStarDetailRequested="onOpenStarDetailRequested"
          @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'capitals' }"
        id="capitals"
      >
        <capitals-table
          @onOpenStarDetailRequested="onOpenStarDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'naturalResources' }"
        id="naturalResources"
      >
        <natural-resources-table
          @onOpenStarDetailRequested="onOpenStarDetailRequested"
        />
      </div>
      <div
        class="tab-pane fade"
        :class="{ 'show active': activeTab === 'technology' }"
        id="technology"
      >
        <technology-table
          @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import MenuTitle from "../MenuTitle.vue";
import StarsTable from "./StarsTable.vue";
import StarTypesTable from "./StarTypesTable.vue";
import CarriersTable from "./CarriersTable.vue";
import ShipsTable from "./ShipsTable.vue";
import CapitalsTable from "./CapitalsTable.vue";
import NaturalResourcesTable from "./NaturalResourcesTable.vue";
import EmpiresTable from "./EmpiresTable.vue";
import TechnologyTable from "./TechnologyTable.vue";

const props = defineProps<{
  tab?: string;
}>();

const emit = defineEmits<{
  onCloseRequested: [];
  onOpenStarDetailRequested: [starId: string];
  onOpenCarrierDetailRequested: [carrierId: string];
  onOpenPlayerDetailRequested: [playerId: string];
}>();

const activeTab = ref<string | null>(null);

const onCloseRequested = () => emit("onCloseRequested");
const onOpenStarDetailRequested = (e: string) =>
  emit("onOpenStarDetailRequested", e);
const onOpenCarrierDetailRequested = (e: string) =>
  emit("onOpenCarrierDetailRequested", e);
const onOpenPlayerDetailRequested = (e: string) =>
  emit("onOpenPlayerDetailRequested", e);

onMounted(() => {
  activeTab.value = props.tab || "empires";
});
</script>

<style scoped>
.nav-item {
  flex-basis: 25%;
}
.nav-link {
  padding: 0.5rem 0.2rem;
  text-align: center;
}
</style>
