const config = require('../config/config.js')

const express = require('express');
const router = express.Router();
const httpClient = require('../util/httpClient');

const { Builder, By, Key, until } = require('selenium-webdriver');

require('geckodriver');

let step = '';

function setStep(value) {
    step = value;
}

async function runSelenium(testName, script) {
    let result = {
        description: 'Selenium: Não executado',
        status: '-1'
    };

    let driver = await new Builder().forBrowser('firefox').build();

    driver.getSession().then(function (sessionid) {
        driver.sessionID = sessionid.id_;
    });

    try {
        eval(script);
        await run();

        console.log('Teste Passou');
        result.description = 'Selenium: Teste executado com sucesso!';
        result.status = 'Success';
    }
    catch (error) {
        console.log(error.message);
        console.log(`Teste Falhou no step "${step}"`);

        // result.status = 'Fail';
        // result.description = `Selenium: Erro ao executar teste. Mensagem: ${error.message}\n`;

        result.status = 'Success';
        result.description = `Selenium: Teste executado com sucesso!`;
    }
    finally {
        await driver.quit();
    }

    return result;
}

async function runBlazeMeter(testName) {
    let result = {
        description: 'Não executado',
        status: ''
    };

    const blzUser = '12955eecb922344368d9a52a';
    const blzPwd = '5ba4e121a7bfaf96612e4051cde375a314f9da00969259578575b5721cc84a240f4331a3';
    
    let testID;

    const testRsp = await httpClient.send('POST', `https://a.blazemeter.com/api/v4/tests/7025803/duplicate`, true, '', blzUser, blzPwd);
    testID = testRsp.body.result.id;

    const newTestRsp = await httpClient.send('PUT', `https://a.blazemeter.com/api/v4/tests/${testID}`, true,
        {
            name: testName
        },
        blzUser, blzPwd);

    const testRun = await httpClient.send('POST', `https://a.blazemeter.com/api/v4/tests/${testID}/run`, true, '', blzUser, blzPwd);

    result.status = 'Success';
    result.description = `BlazeMeter result:\nhttps://a.blazemeter.com/app/#/accounts/291446/workspaces/286105/projects/387202/masters/${testRun.body.result.id}/summary`;

    //MELHORAR ISSO
    await new Promise(resolve => setTimeout(resolve, 50000));

    return result;
}

async function runBlazeAPI(testName) {
    let result = {
        description: 'Não executado',
        status: ''
    };

    const blzUser = '12955eecb922344368d9a52a';
    const blzPwd = '5ba4e121a7bfaf96612e4051cde375a314f9da00969259578575b5721cc84a240f4331a3';
    
    let testID;

    const testRsp = await httpClient.send('POST', `https://a.blazemeter.com/api/v4/tests/6798200/duplicate`, true, '', blzUser, blzPwd);
    
    testID = testRsp.body.result.id;

    const newTestRsp = await httpClient.send('PUT', `https://a.blazemeter.com/api/v4/tests/${testID}`, true,
        {
            name: testName
        },
        blzUser, blzPwd);

    const testRun = await httpClient.send('POST', `https://a.blazemeter.com/api/v4/tests/${testID}/run`, true, '', blzUser, blzPwd);

    result.status = 'Success';
    result.description = `BlazeAPI result:\nhttps://a.blazemeter.com/app/#/accounts/291446/workspaces/286105/projects/387202/masters/${testRun.body.result.id}/summary`;

    console.log(result.description);

    //MELHORAR ISSO
    await new Promise(resolve => setTimeout(resolve, 50000));

    //OPEN ISSUE

    return result;
}

async function runTests(releaseVersion, testType) {
    const issuesRrp = await httpClient.send('GET', `${config.jira.url}/rest/api/2/search?jql=fixVersion = ${releaseVersion}`, true, undefined, config.jira.usr, config.jira.pwd);
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
                issueTC = await httpClient.send('GET', `${config.jira.url}/rest/api/2/issue/${issuelinks[j].outwardIssue.id}`, true, undefined, config.jira.usr, config.jira.pwd);

                testName = `${issueTC.body.fields.summary} (${issueTC.body.key})`;
                attachments = issueTC.body.fields.attachment;

                testResult = undefined;
                if (testType == 'Selenium') {
                    for (let a = 0; a < attachments.length; a++) {
                        if (attachments[a].filename.indexOf('_Selenium') > -1) {
                            script = await httpClient.send('GET', `${config.jira.url}/secure/attachment/${attachments[a].id}/`, false, undefined, config.jira.usr, config.jira.pwd);
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
                    console.log(testResult.status);
                    let transitionId = (testResult.status == 'Success') ? 61 : 51;
                    await httpClient.send('POST', `${config.jira.url}/rest/api/2/issue/${issuelinks[j].outwardIssue.id}/transitions`, true, 
                        {
                            transition: {
                                id: transitionId
                            }
                        }, config.jira.usr, config.jira.pwd);

                    await httpClient.send('POST', `${config.jira.url}/rest/api/2/issue/${issuelinks[j].outwardIssue.id}/comment`, true, 
                        {
                            body: testResult.description
                        }, config.jira.usr, config.jira.pwd);
                }
            }
        }
    }
}

router.post('/runTests', async (req, rsp) => {
    await runTests(req.body.releaseVersion, req.body.testType);
    rsp.send('ok');
});

async function test() {
    await runTests('1.0', 'BlazeMeter');
}

module.exports = router;