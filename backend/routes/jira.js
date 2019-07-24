const config = require('../config/config.js')

const express = require('express');
const router = express.Router();

const httpClient = require('../util/httpClient');

router.post('/release', async (req, rsp) => {
    const result = await httpClient.send('GET', 
        `${config.jenkins.url}/job/LisaBank/buildWithParameters?token=token&releaseVersion=${req.body.version.name}`, 
        false, undefined, config.jenkins.usr, config.jenkins.pwd);
    
    console.log(`GET ${config.jenkins.url}/job/LisaBank/buildWithParameters?token=token&releaseVersion=${req.body.version.name}`);
    console.log(result.body);
    rsp.send('ok');
});

router.post('/testCase', async (req, rsp) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const issue = await httpClient.send('GET', `${config.jira}/rest/api/2/issue/${req.body.issue.id}`, true, undefined, config.jira.usr, config.jira.pwd);

    let attID = 0;
    const attachments = issue.body.fields.attachment;
    let attachment;

    for (let i = 0; i < attachments.length; i++) {
        attachment = attachments[i];
        if (attachment.filename.indexOf('Zephyr') > -1) attID = attachment.id;
    }

    if (attID > 0) {
        const urlCreateStep = `${config.jira}/rest/zapi/latest/teststep/${issue.body.id}`;
        const fileURL = `${config.jira}/secure/attachment/${attID}/`;
        const fileURLDelete = `${config.jira}/rest/api/2/attachment/${attID}`;

        const zephyrScript = await httpClient.send('GET', fileURL, false, undefined, config.jira.usr, config.jira.pwd);
    
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
                }, config.jira.usr, config.jira.pwd);
            }
        }

        await httpClient.send('DELETE', fileURLDelete, true, undefined, config.jira.usr, config.jira.pwd);
    }

    rsp.send('ok');
});

module.exports = router;