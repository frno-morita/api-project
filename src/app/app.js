var express = require('express');
var compression = require('compression');
var app = express();
var index = require('./routes/artist');
var cache = require('express-redis-cache')({
    host: 'redis'
});

app.use(compression());
app.use('/', index);

/*app.get('/:mbId',
    cache.route(),
    (req, res) => res.send('Hello World 2')
);*/

app.listen(4711, () => console.log('Example app listening on port 80!'));
