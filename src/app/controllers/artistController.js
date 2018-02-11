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
                } else if (res.statusCode < 499) {
                    resolve({status: res.statusCode, data: data});
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

        https.get(options, (res) => {
            res.on('data', (body) => {
                data += body;
            });

            res.on('close', () => {
                resolve({status: 500, type: 'wikipedia', error: "Socket closed for wikipedia"});
            });

            res.on('end', () => {
                if (res.statusCode < 399) {
                    let wikiData = JSON.parse(data);
                    let description = '';
                    if (wikiData && wikiData.query && wikiData.query.pages) {
                        for (let page in wikiData.query.pages) {
                            description = wikiData.query.pages[page].extract;
                            break;
                        }
                    }
                    resolve({status: 200, type: 'wikipedia', data: description});
                } else {
                    resolve({status: 500, type: 'wikipedia', data: data});
                }
            });
        }).on('error', (e) => {
            resolve({status: 500, type: 'wikipedia', error: e.message});
        });
    });
}

// HTTPS Get wrapper that can handle redirects
function httpsGet(uri, resolve, reject, object) {
    let data = '';

    https.get(uri, (res) => {
        res.on('data', (body) => {
            data += body;
        });

        res.on('close', () => {
            resolve({status: 500, type: 'coverartarchive', error: "Socket closed", data: object});
        });
    
        res.on('end', () => {
            if (res.statusCode < 300) {
                let images = JSON.parse(data);
                for (let i = 0; i < images.images.length; i++) {
                    object.images.push(images.images[i].image);
                }
                resolve({status: 200, type: 'coverartarchive', data: object});
            } else if (res.statusCode < 399 && res.headers.location) {
                httpsGet(res.headers.location, resolve, reject, object);
            } else {
                resolve({status: 500, type: 'coverartarchive', statusCode: res.statusCode, uri: uri, data: object});
            }
        });

    }).on('error', (e) => {
        resolve({status: 500, type: 'coverartarchive', error: e.message, data: object});
    });
}

// Generate Promise that will call the CoverartArchive API
function coverArtArchiveApiCall(mbid, object) {
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
                resolve({status: 500, type: 'coverartarchive', error: "socket closed", data: object});
            });

            res.on('end', () => {
                if (res.statusCode < 300) {
                    let images = JSON.parse(data);
                    for (let i = 0; i < images.images.length; i++) {
                        object.images.push(images.images[i].image);
                    }
                    resolve({status: 200, type: 'coverartarchive', data: object});
                } else if (res.statusCode < 399 && res.headers.location) {
                    httpsGet(res.headers.location, resolve, reject, object);
                } else {
                    resolve({status: 500, type: 'coverartarchive', statusCode: res.statusCode, uri: options.path, data: object});
                }
            });
        }).on('error', (e) => {
            resolve({status: 500, type: 'coverartarchive', error: e, data: object});
        });
    });
}

// Generate the full array of promises that will
// be used in the Promise.all block
function generatePromises(data) {
    let ret = [];
    
    try {
        let json = JSON.parse(data);
        for (let i = json.relations.length; i > 0; --i) {
            if (json.relations[i] && json.relations[i].type && json.relations[i].type === 'wikipedia') {
                let arr = (json.relations[i].url.resource).split('/');
                ret.push(wikipediaApiCall(arr[arr.length - 1]));
                break;
            }
        }

        for (let j = json['release-groups'].length - 1; j >= 0; j--) {
            if (json['release-groups'][j]) {
                ret.push(coverArtArchiveApiCall(json['release-groups'][j].id, {
                    "title": json['release-groups'][j].title,
                    "id": json['release-groups'][j].id,
                    "images": []
                }));
            }
        }

    } catch (e) {
        return [new Promise((resolve, reject) => {
            reject(e);
        })];
    }

    if (!ret.length) {
        return [new Promise((resolve, reject) => {
            reject(e);
        })];
    } else {
        return ret;
    }
}

// Take the result from all API calls and generate
// the final JSON we will send back to the client
function prepareResultData(mbid, data) {
    let wikiDescription = '';
    let albums = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i].type === 'wikipedia') {
            wikiDescription = data[i].data;
        } else if (data[i].type === 'coverartarchive') {
            albums.push(data[i].data);
        }
    }

    return {
        "mbid": mbid,
        "description": wikiDescription,
        "albums": albums
    };
}

// Send back not implemented status
exports.not_implemented = (req, res) => res.status(501).send({error: req.method + ' not implemented for this endpoint'});

// Retrieve detail information about specific artist
// This is what we will be implementing later in the assignment
exports.artist_detail = (req, res) => {
    // Set response header content-type since we
    // always send back a JSON in the response
    res.setHeader('content-type', 'application/json'); 
    // Start API chain
    musicbrainzApiCall(req.params.id).then((data) => {
        if (data.status === 200) {
            try {
                Promise.all(generatePromises(data.data)).then(results => {
                    res.status(200).send(prepareResultData(req.params.id, results));  
                }).catch((error) => {
                    res.status(500).send({error: error});
                });
            } catch (e) {
                res.status(500).send({error: e});
            }
        } else {
            res.status(data.status).send(data.data);
        }
    }).catch((e) => {
        res.status(500).send({error: e});
    });
}
