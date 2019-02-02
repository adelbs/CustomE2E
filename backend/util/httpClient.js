const rp = require('request-promise');
const token = require('basic-auth-token');

async function send(method, url, jsonbody = false, body = undefined, user = 'admin', pwd = 'admin') {
    let options = {
        method: method,
        uri: url,
        json: jsonbody,
        resolveWithFullResponse: true,
        simple: false,
        headers: {
            'Authorization': `Basic ${token(user, pwd)}`
        }
    };

    if (body != undefined) options.body = body;

    if (jsonbody)
        options.headers['content-type'] = 'application/json';
    else
        options.headers['content-type'] = 'text/xml';

    return await rp(options);
}

module.exports.send = send;