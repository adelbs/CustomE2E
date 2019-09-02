const config = require('../config/config.js')

const fs = require('fs');
const express = require('express');
const router = express.Router();

const httpClient = require('../util/httpClient');

router.post('/cdd', async (req, rsp) => {
    const filePath = 'C:\\Users\\jacfe02\\Documents\\GitHub\\CustomE2E\\';
    let fileContent = fs.readFileSync(`${filePath}release-template.json`);
    fs.writeFileSync(`${filePath}release.json`, fileContent.toString().replace(/0.0/g, req.body.releaseVersion));

    const createRelease = await httpClient.send('POST',
        `${config.cdd.url}/administration/0000/v1/dsl-manifest/attachment`,
        false, undefined, config.cdd.usr, config.cdd.pwd, config.cdd.endpoint, `${filePath}release.json`);

    const data = JSON.parse(createRelease.body).data;

    let release = 0;
    let phase = 0;
    for (let i = 0; i < data.entities.length; i++) {
        if (data.entities[i].kind == 'Release') release = data.entities[i].id;
        else if (data.entities[i].kind == 'Phase' && phase == 0) phase = data.entities[i].id;
    }

    const resRun = await httpClient.send('PATCH',
        `${config.cdd.url}/execution/00000000-0000-0000-0000-000000000000/v1/releases-execution/${release}/phases-execution/${phase}`,
        true,
        { className: 'PhaseExecutionDto', status: 'RUNNING' }, config.cdd.usr, config.cdd.pwd, config.cdd.endpoint);

    console.log(`Version: ${req.body.releaseVersion}`);
    console.log(`PATCH ${config.cdd.url}/execution/00000000-0000-0000-0000-000000000000/v1/releases-execution/${release}/phases-execution/${phase}`)
    console.log(resRun.statusCode);

    rsp.send('ok');
});

module.exports = router;