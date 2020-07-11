const moment = require('moment');

module.exports = class TimeService {

    // TODO: Should we really be calculating time server side?
    calculateTimeByTicks(ticks, speedInMins, relativeTo = null) {
        if (relativeTo == null) {
            relativeTo = moment().utc();
        } else {
            relativeTo = moment(relativeTo).utc();
        }

        return relativeTo.add(ticks * speedInMins, 'm');
    }

};
