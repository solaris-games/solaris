const moment = require('moment');

module.exports = class TimeService {

    calculateTimeByTicks(ticks, speedInMins, relativeTo = null) {
        if (relativeTo == null) {
            relativeTo = moment();
        } else {
            relativeTo = moment(relativeTo);
        }

        return relativeTo.add(ticks * speedInMins, 'm');
    }

};
