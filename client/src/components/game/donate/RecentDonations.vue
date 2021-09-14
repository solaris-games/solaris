<template>
<div>
    <div class="list-group">
        <a href="https://www.buymeacoffee.com/hyperi0n" target="_blank" class="list-group-item list-group-item-action flex-column align-items-start" v-for="donation in donations" :key="donation.support_id">
            <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{donation.supporter_name}}</h5>
            <small>{{getFriendlyDate(donation.support_created_on)}}</small>
            </div>
            <p class="mb-1">{{getFriendlyNote(donation.support_note)}}</p>
            <small class="text-warning">Donated {{donation.support_coffees}} coffee<span v-if="donation.support_coffees > 1">s</span></small>
        </a>
    </div>
</div>
</template>

<script>
import UserApiService from '../../../services/api/user'
import * as moment from 'moment'

export default {
  data () {
    return {
        donations: []
    };
  },
  async mounted () {
    try {
        let response = await UserApiService.listRecentDonations()

        if (response.status === 200) {
            this.donations = response.data
        }
    } catch (err) {
        console.log(err)
    }
  },
  methods: {
      getFriendlyDate(date) {
          return moment(date).utc().fromNow()
      },
      getFriendlyNote(note) {
          if (note == null) {
              return null
          }

          if (note.length > 75) {
              return '"' + note.substring(0, 75) + '..."'
          }

          return '"' + note + '"'
      }
  }
}
</script>

<style scoped>

</style>
