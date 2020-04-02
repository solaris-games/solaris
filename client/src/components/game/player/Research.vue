<template>
<div class="row bg-primary">
    <div class="col">
    <table class="table table-sm mb-0">
        <thead>
            <tr v-if="userPlayer && player != userPlayer">
                <th></th>
                <th></th>
                <th class="text-right">You</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Scanning</td>
                <td class="text-right">{{player.research.scanning.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.scanning.level > player.research.scanning.level,
                            'text-danger': userPlayer.research.scanning.level < player.research.scanning.level}">{{userPlayer.research.scanning.level}}</td>
            </tr>
            <tr>
                <td>Hyperspace Range</td>
                <td class="text-right">{{player.research.hyperspaceRange.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.hyperspaceRange.level > player.research.hyperspaceRange.level,
                            'text-danger': userPlayer.research.hyperspaceRange.level < player.research.hyperspaceRange.level}">{{userPlayer.research.hyperspaceRange.level}}</td>
            </tr>
            <tr>
                <td>Terraforming</td>
                <td class="text-right">{{player.research.terraforming.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.terraforming.level > player.research.terraforming.level,
                            'text-danger': userPlayer.research.terraforming.level < player.research.terraforming.level}">{{userPlayer.research.terraforming.level}}</td>
            </tr>
            <tr>
                <td>Experimentation</td>
                <td class="text-right">{{player.research.experimentation.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.experimentation.level > player.research.experimentation.level,
                            'text-danger': userPlayer.research.experimentation.level < player.research.experimentation.level}">{{userPlayer.research.experimentation.level}}</td>
            </tr>
            <tr>
                <td>Weapons</td>
                <td class="text-right">{{player.research.weapons.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.weapons.level > player.research.weapons.level,
                            'text-danger': userPlayer.research.weapons.level < player.research.weapons.level}">{{userPlayer.research.weapons.level}}</td>
            </tr>
            <tr>
                <td>Banking</td>
                <td class="text-right">{{player.research.banking.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right"
                    :class="{'text-success': userPlayer.research.banking.level > player.research.banking.level,
                            'text-danger': userPlayer.research.banking.level < player.research.banking.level}">{{userPlayer.research.banking.level}}</td>
            </tr>
            <tr>
                <td>Manufacturing</td>
                <td class="text-right">{{player.research.manufacturing.level}}</td>
                <td v-if="userPlayer && player != userPlayer" class="text-right" 
                    :class="{'text-success': userPlayer.research.manufacturing.level > player.research.manufacturing.level,
                            'text-danger': userPlayer.research.manufacturing.level < player.research.manufacturing.level}">{{userPlayer.research.manufacturing.level}}</td>
            </tr>
        </tbody>
    </table>
    </div>
</div>
</template>

<script>
export default {
  props: {
    game: Object,
    player: Object,
    userPlayer: Object
  }
}
</script>

<style scoped>
</style>
