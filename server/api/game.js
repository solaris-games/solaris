const express = require('express');
const router = express.Router();

router.get('/defaultSettings', (req, res, next) => {
    return res.status(200).json(require('../data/db/misc/defaultGameSettings.json'));
});

module.exports = router;
