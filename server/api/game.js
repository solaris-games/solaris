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

router.get('/:id', (req, res, next) => {
    return res.status(200).json({
        _id: req.params.id,
        settings: {
            general: {
                name: 'Test',
                description: 'Test description'
            }
        }
    });
});

module.exports = router;
