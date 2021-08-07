<template>
  <view-container>
    <view-title title="Galaxy Editor" navigation="home"/>
       <galaxy-editor/>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import GalaxyEditorContainer from '../components/galaxy-editor/GalaxyEditorContainer'
import router from '../router'
import ViewTitle from '../components/ViewTitle'
import FormErrorList from '../components/FormErrorList'
import userService from '../services/api/user'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'galaxy-editor': GalaxyEditorContainer
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
