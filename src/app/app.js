var express = require('express');
var app = express();
var compression = require('compression');
var index = require('./routes/artist');

app.use(compression());
app.use('/', index);

app.listen(80, () => console.log('Api-project app is now listening on port 80.'));
