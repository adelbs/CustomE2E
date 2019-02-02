const express = require('express');
const router = express.Router();
const httpClient = require('../util/httpClient');

const { Builder, By, Key, until } = require('selenium-webdriver');
const SauceLabs = require("saucelabs");

require('geckodriver');

let step = '';
const user = 'felipe.jacob@ca.com';
const apiKey = 'c7c6000d-922b-4437-8059-782f36120ac3';

let saucelabs = new SauceLabs({
    username: user,
    password: apiKey
});

function setStep(value) {
    step = value;
}

async function runSelenium(testName, script) {
    let result = {
        description: 'Não executado',
        status: '-1'
    };

    // let driver = await new Builder().forBrowser('firefox').build();
    let driver = await new Builder().withCapabilities({
        browserName: 'firefox',
        username: user,
        accessKey: apiKey
    }).usingServer(`http://${user}:${apiKey}@ondemand.saucelabs.com:80/wd/hub`).build();

    driver.getSession().then(function (sessionid) {
        driver.sessionID = sessionid.id_;
    });

    try {
        eval(script);
        await run();

        console.log('Teste Passou');
        result.description = '';
        result.status = '1';

        saucelabs.updateJob(driver.sessionID, {
            name: testName,
            passed: true
        });
    }
    catch (error) {
        console.log(error.message);
        console.log(`Teste Falhou no step "${step}"`);

        result.status = '2';
        result.description = `${error.message}\n`;

        saucelabs.updateJob(driver.sessionID, {
            name: testName,
            passed: false
        });
    }
    finally {
        result.description += `SauceLabs results:\nhttps://app.saucelabs.com/tests/${driver.sessionID}`;
        await driver.quit();
    }

    return result;
}

async function runBlazeMeter(testName) {
    let result = {
        description: 'Não executado',
        status: '-1'
    };

    const blzUser = 'dc1e874dabf64f5614399bd6';
    const blzPwd = '0649439361e2b0745ba775a74df7b538b6fb06c5c34dfb2062fd1b1b7c35253f1a6b9fc5';
    
    let testID;

    const testRsp = await httpClient.send('POST', `https://a.blazemeter.com:443/api/v4/tests/5999461/duplicate`, true, '', blzUser, blzPwd);
    testID = testRsp.body.result.id;

    const newTestRsp = await httpClient.send('PUT', `https://a.blazemeter.com/api/v4/tests/${testID}`, true,
        {
            name: testName
        },
        blzUser, blzPwd);

    const testRun = await httpClient.send('POST', `https://a.blazemeter.com:443/api/v4/tests/${testID}/run`, true, '', blzUser, blzPwd);

    result.status = '1';
    result.description = `BlazeMeter result:\nhttps://a.blazemeter.com/app/#/accounts/152727/workspaces/146242/projects/194114/masters/${testRun.body.result.id}/summary`;

    //MELHORAR ISSO
    await new Promise(resolve => setTimeout(resolve, 110000));

    return result;
}

async function runBlazeAPI(testName) {
    let result = {
        description: 'Não executado',
        status: '-1'
    };

    const blzUser = 'dc1e874dabf64f5614399bd6';
    const blzPwd = '0649439361e2b0745ba775a74df7b538b6fb06c5c34dfb2062fd1b1b7c35253f1a6b9fc5';
    
    let testID;

    const testRsp = await httpClient.send('POST', `https://a.blazemeter.com:443/api/v4/tests/6487793/duplicate`, true, '', blzUser, blzPwd);
    testID = testRsp.body.result.id;

    const newTestRsp = await httpClient.send('PUT', `https://a.blazemeter.com/api/v4/tests/${testID}`, true,
        {
            name: testName
        },
        blzUser, blzPwd);

    const testRun = await httpClient.send('POST', `https://a.blazemeter.com:443/api/v4/tests/${testID}/run`, true, '', blzUser, blzPwd);

    result.status = '2';
    result.description = `BlazeAPI result:\nhttps://a.blazemeter.com/app/#/accounts/152727/workspaces/146242/projects/194114/masters/${testRun.body.result.id}/summary`;

    //MELHORAR ISSO
    await new Promise(resolve => setTimeout(resolve, 50000));

    //OPEN ISSUE

    return result;
}

async function runTests(releaseVersion, testType) {
    const issuesRrp = await httpClient.send('GET', `http://localhost:8085/rest/api/2/search?jql=project = LisaBank AND fixVersion = ${releaseVersion}`, true, undefined, 'adelbs', 'sadb123');
    const issues = issuesRrp.body.issues;
    let issuelinks;
    let issueTC;
    let attachments;
    let scriptStr;

    let execution;
    let executionId;

    let testName;
    let testResult;

    for (let i = 0; i < issues.length; i++) {
        issuelinks = issues[i].fields.issuelinks;
        for (let j = 0; j < issuelinks.length; j++) {

            if (issuelinks[j].outwardIssue != undefined) {
                issueTC = await httpClient.send('GET', `http://localhost:8085/rest/api/2/issue/${issuelinks[j].outwardIssue.id}`, true, undefined, 'adelbs', 'sadb123');
                testName = `${issueTC.body.fields.summary} (${issueTC.body.key})`;
                attachments = issueTC.body.fields.attachment;

                testResult = undefined;
                if (testType == 'Selenium') {
                    for (let a = 0; a < attachments.length; a++) {
                        if (attachments[a].filename.indexOf('_Selenium') > -1) {
                            script = await httpClient.send('GET', `http://localhost:8085/secure/attachment/${attachments[a].id}/`, false, undefined, 'adelbs', 'sadb123');
                            scriptStr = `async function run() {${script.body}}`;
                            testResult = await runSelenium(testName, scriptStr);
                            break;
                        }
                    }
                }
                else if (testType == 'BlazeMeter') {
                    testResult = await runBlazeMeter(testName);
                }
                else if (testType == 'BlazeAPI') {
                    testResult = await runBlazeAPI(testName);
                }

                if (testResult != undefined) {
                    execution = await httpClient.send('POST', 'http://localhost:8085/rest/zapi/latest/execution', true, {
                        cycleId: '-1',
                        issueId: issueTC.body.id,
                        projectId: issueTC.body.fields.project.id
                    }, 'adelbs', 'sadb123');

                    executionId = Object.keys(execution.body)[0];

                    execution = await httpClient.send('PUT', `http://localhost:8085/rest/zapi/latest/execution/${executionId}/execute`, true,
                        {
                            id: executionId,
                            status: testResult.status,
                            comment: testResult.description,
                            changeAssignee: false
                        }
                        , 'adelbs', 'sadb123');
                }
            }
        }
    }
}

router.post('/runTests', async (req, rsp) => {
    await runTests(req.body.releaseVersion, req.body.testType);
    rsp.send('ok');
});

module.exports = router;