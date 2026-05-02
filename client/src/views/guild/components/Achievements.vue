<template>
  <div v-if="achievements?.length" class="mt-2 mb-1">
    <ul class="list-unstyled">
      <li v-for="(achievement, index) in achievements" :key="index">
        <i :class="iconClass(achievement.icon)" class="me-2 mt-1 text-warning"></i>
        <span>{{ achievement.description }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    achievements: {
      type: Array,
      required: true
    }
  },
  methods: {
    iconClass (icon) {
      const map = {
        victory: 'fas fa-trophy'
      };
      return map[icon] || 'fas fa-star';
    }
  }
}
</script>
