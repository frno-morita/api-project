//const http = require('http');
const https = require('https');
 
// Generate Promise that will call the Musicbrainz API
function musicbrainzApiCall(mbid) {
    return new Promise((resolve, reject) => {
        let data = '';
        let options = {
            host: 'musicbrainz.org',
            path: '/ws/2/artist/' + mbid + '?fmt=json&inc=url-rels+release-groups',
            headers: {
                'user-agent': 'PostmanRuntime/7.1.1',
                'accept': 'application/json'
            }
        };

        https.get(options, (res) => {
            res.on('data', (body) => {
                data += body;
            });

            res.on('close', () => {
                reject({status: 500});
            });

            res.on('end', () => {
                if (res.statusCode < 399) {
                    resolve({status: 200, data: data});
                } else if (res.statusCode === 400) {
                    resolve({status: 400, data: data});
                } else {
                    reject({status: 500});
                }
            });

        }).on('error', (e) => {
            reject({status: 500, error: e.message});
        });
    });
}

// Generate Promise that will call the Wikipedia API
function wikipediaApiCall(id) {
    return new Promise((resolve, reject) => {
        let data = '';
        let options = {
            host: 'en.wikipedia.org',
            path: '/w/api.php?action=query&format=json&prop=extracts&exintro=true&redirects=true&titles=' + id,
            headers: {
                'user-agent': 'PostmanRuntime/7.1.1',
                'accept': 'application/json'
            }
        };

        console.log(options);

        https.get(options, (res) => {
            res.on('data', (body) => {
                data += body;
            });

            res.on('close', () => {
                console.log('closed');
                reject({status: 500});
            });

            res.on('end', () => {
                if (res.statusCode < 399) {
                    console.log('response: ', res);
                    console.log('data: ', data);
                    resolve({status: 200, data: data});
                } else {
                    console.log('response: ', res);
                    console.log('data: ', data);
                    reject({status: 500});
                }
            });
        }).on('error', (e) => {
            console.log('error: ', e.message);
            reject({status: 500, error: e.message});
        });
    });
}

// Generate Promise that will call the CoverartArchive API
function coverArtArchiveApiCall(mbid) {
    return new Promise((resolve, reject) => {
        let data = '';
        let options = {
            host: 'coverartarchive.org',
            path: '/release-group/' + mbid,
            headers: {
                'user-agent': 'PostmanRuntime/7.1.1',
                'accept': 'application/json'
            }
        };

        https.get(options, (res) => {
            res.on('data', (body) => {
                data += body;
            });

            res.on('close', () => {
                reject({status: 500});
            });

            res.on('end', () => {
                if (res.statusCode < 399) {
                    resolve({status: 200, data: data});
                } else {
                    reject({status: 500});
                }
            });
        }).on('error', (e) => {
            reject({status: 500}); 
        });
    });
}

// Generate the full array of promises that will
// be used in the Promise.all block
function generatePromises(data) {
    let ret = [];
    
    try {
        let json = JSON.parse(data);
        console.log(json);
        for (let i = json.relations.length; i > 0; --i) {
            console.log(json.relations[i]);
            if (json.relations[i] && json.relations[i].type && json.relations[i].type === 'wikipedia') {
                let arr = (json.relations[i].url.resource).split('/');
                console.log(arr);
                ret.push(wikipediaApiCall(arr[arr.length - 1]));
                break;
            }
        }
    } catch (e) {
        return [new Promise((resolve, reject) => {
            console.log(e.message);
            reject();
        })];
    }

    return ret;
}

// Take the result from all API calls and generate
// the final JSON we will send back to the client
function prepareResultData(data) {
    console.log("Preparing data");
    console.log(data);
    return {data: data};
}

// Send back not implemented status
exports.not_implemented = (req, res) => res.status(501).send({error: req.method + ' not implemented for this endpoint'});

// Retrieve detail information about specific artist
// This is what we will be implementing later in the assignment
exports.artist_detail = (req, res) => {
    musicbrainzApiCall(req.params.id).then((data) => {
        if (data.status === 200) {
            try {
                Promise.all(generatePromises(data.data)).then(results => {
                    res.setHeader('content-type', 'application/json');
                    res.status(200).send(prepareResultData(results));  
                }).catch((error) => {
                    res.sendStatus(500);
                });
            } catch (e) {
                res.sendStatus(500);
            }
        } else {
            res.setHeader('content-type', 'application/json');
            res.status(data.status).send(data.data);
        }
    }).catch((error) => {
        res.sendStatus(error.status);
    });
}
