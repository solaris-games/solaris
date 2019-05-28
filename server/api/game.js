const express = require('express');
const router = express.Router();

router.get('/defaultSettings', (req, res, next) => {
    return res.status(200).json(require('../data/db/misc/defaultGameSettings.json'));
});

router.post('/', (req, res, next) => {
    return res.status(201).json({
        _id: 1
    });
});

module.exports = router;
