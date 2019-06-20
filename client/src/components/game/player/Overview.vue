<template>
<div>
    <div class="row" :style="{'background-color':player.colour.value.replace('0x', '#')}">
        <div class="col">
            <h4 class="pt-2">{{player.alias}}</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-auto">
            <div class="row col pl-0 pr-0">
                <img src="../../../assets/avatars/0.jpg">
            </div>
            <div class="row bg-primary">
                <div class="col pt-2 pb-2">
                    <button class="btn btn-primary"><i class="fas fa-envelope"></i></button>
                    <button class="btn btn-info ml-1"><i class="fas fa-chart-line"></i></button>
                </div>
            </div>
        </div>
        <div class="col">
            <table class="table table-sm mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th class="text-center">You</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Stars</td>
                        <td class="text-center">0</td>
                    </tr>
                    <tr>
                        <td>Total Carriers</td>
                        <td class="text-center">{{player.carriers.length}}</td>
                    </tr>
                    <tr>
                        <td>Total Ships</td>
                        <td class="text-center">0</td>
                    </tr>
                    <tr>
                        <td>New Ships</td>
                        <td class="text-center">0</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        player: Object
    }
}
</script>

<style scoped>
img {
    width: 160px;
    height: 160px;
}
</style>
