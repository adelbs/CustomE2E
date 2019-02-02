const express = require('express');
const router = express.Router();

const httpClient = require('../util/httpClient');

const jenkinsPort = '8080';
const jiraPort = '8085';
const jiraUser = 'Administrator';
const jiraPwd = 'CAdemo123';

router.post('/release', async (req, rsp) => {
    const result = await httpClient.send('GET', 
        `http://localhost:${jenkinsPort}/job/LisaBank/buildWithParameters?token=token&releaseVersion=${req.body.version.name}`, 
        false, undefined, 'admin', 'admin');
    
    rsp.send('ok');
});

router.post('/testCase', async (req, rsp) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const issue = await httpClient.send('GET', `http://localhost:${jiraPort}/rest/api/2/issue/${req.body.issue.id}`, true, undefined, jiraUser, jiraPwd);

    let attID = 0;
    const attachments = issue.body.fields.attachment;
    let attachment;

    for (let i = 0; i < attachments.length; i++) {
        attachment = attachments[i];
        if (attachment.filename.indexOf('Zephyr') > -1) attID = attachment.id;
    }

    if (attID > 0) {
        const urlCreateStep = `http://localhost:${jiraPort}/rest/zapi/latest/teststep/${issue.body.id}`;
        const fileURL = `http://localhost:${jiraPort}/secure/attachment/${attID}/`;
        const fileURLDelete = `http://localhost:${jiraPort}/rest/api/2/attachment/${attID}`;

        const zephyrScript = await httpClient.send('GET', fileURL, false, undefined, jiraUser, jiraPwd);
    
        let stepLines;
        let strStep;
        let strExpected;
        let auxData;
        let strData;
    
        const steps = zephyrScript.body.split('!End');
        let step;
        let line;

        for (let i = 0; i < steps.length; i++) {
            step = steps[i];

            strStep = '';
            strExpected = '';
            auxData = '';
            strData = '';

            stepLines = step.split('\n');

            for (let j = 0; j < stepLines.length; j++) {
                line = stepLines[j];
                if (line.indexOf('!Step') > -1)
                    strStep = line.substring(line.indexOf('!Step=') + 6);
                else if (line.indexOf('!Expected') > -1)
                    strExpected = line.substring(line.indexOf('!Expected=') + 10);
                else if (line.indexOf('!Data') > -1) {
                    auxData = line.substring(line.indexOf('!Data=') + 6).split(',');
                    strData += auxData[0] +'='+ auxData[1] +'\n';
                }
            }

            if (strStep != '') {
                await httpClient.send('POST', urlCreateStep, true, {
                    step: strStep,
                    data: strData,
                    result: strExpected
                }, jiraUser, jiraPwd);
            }
        }

        await httpClient.send('DELETE', fileURLDelete, true, undefined, jiraUser, jiraPwd);
    }

    rsp.send('ok');
});

module.exports = router;