<template>
    <span>{{currentText}}</span>
</template>
<script>
import moment from 'moment';
import GameHelper from '../../../services/gameHelper';

export default {
    props: {
        endDate: Object,
        afterEndText: String,
        active: Boolean,
    },
    data () {
        return {
            currentText: '',
            intervalFunction: null
        }
    },
    mounted () {
        this.recalculateTime();
        this.intervalFunction = setInterval(this.recalculateTime, 250);
    },
    unmounted () {
        if (this.intervalFunction) {
            clearInterval(this.intervalFunction);
        }
    },
    methods: {
        recalculateTime () {
            if (!this.endDate) {
                this.currentText = this.afterEndText;
                return;
            }
            const current = moment().utc();
            const delta = moment(this.endDate).utc() - current;
            if (delta < 0 || !this.active) {
                this.currentText = this.afterEndText;
            } else {
                this.currentText = GameHelper.getDateToString(delta);
            }
        }
    }
}
</script>
<style>
</style>
