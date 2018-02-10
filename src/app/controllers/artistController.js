const http = require('http');
// Send back not implemented status
exports.not_implemented = (req, res) => res.status(501).send({error: req.method + ' not implemented for this endpoint'});

// Retrieve detail information about specific artist
// This is what we will be implementing later in the assignment
exports.artist_detail = (req, res) => {
    var options = {
        host: 'musicbrainz.org',
        path: '/ws/2/artist/' + req.params.id + '?fmt=json&inc=url-rels+release-groups',
        headers: {
            'user-agent': 'PostmanRuntime/7.1.1',
            'accept': 'application/json'
        }
    };

    console.log(options);

    http.get(options, (pres) => {
        console.log('Got response: ' + pres.statusCode);

        var data = '';
        pres.on('data', (body) => {
            data += body;
        });

        pres.on('end', () => {
            console.log(data);
            if (pres.statusCode < 399) {
                res.setHeader('content-type', 'application/json');
                res.status(200).send(data);
            } else if (pres.statusCode === 400) {
                res.setHeader('content-type', 'application/json');
                res.status(400).send(data);
            } else {
                console.log('Faulty status');
                res.sendStatus(pres.statusCode);
            }
        });

    }).on('error', (e) => {
        console.log('Got error: ' + e.message);
        res.status(501).send();
    });
}
