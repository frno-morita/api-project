'use strict';

var express = require('express');
var router = express.Router();
const cache = require('express-redis-cache')({ host: 'redis' });
// Require artist controller module
var artist_controller = require('../controllers/artistController');

// Set the artist with id endpoint to our function
router.get('/:id', cache.route(), artist_controller.artist_detail);

// Set all other routes as not implemented
router.all('*', artist_controller.not_implemented);

module.exports = router;