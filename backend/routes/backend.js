const env = require('../config/env');

const rp = require('request-promise');
const xml2js = require('xml2js-es6-promise');

const express = require('express');
const router = express.Router();

async function send(url, body, token = null) {
    let fullBody = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.w3.org/2001/XMLSchema">
      <soapenv:Body>
      ${body}
      </soapenv:Body>
    </soapenv:Envelope>`;

    let options = {
        method: 'POST',
        uri: url,
        json: false,
        resolveWithFullResponse: true,
        simple: false,
        headers: {
            'content-type': 'text/xml'
        },
        body: fullBody
    };

    if (token != null) options.headers.Token = token;

    return await rp(options);
}

router.post('/newtoken', async (req, rsp) => {
    const body = `
    <getNewToken xmlns="http://ejb3.examples.itko.com/">
      <username xmlns="">${req.body.user}</username>
      <password xmlns="">${req.body.password}</password>
    </getNewToken>`;

    const rspWS = await send(`${env.url}/TokenBean`, body);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    if (rspWS.statusCode == 200)
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:getNewTokenResponse'][0].return[0]
    else
        result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0];

    console.log('New Token: ' + result);
    console.log('--------------------------------------------------------------------');

    rsp.status(rspWS.statusCode).send({ result: result });
});

router.post('/deletetoken', async (req, rsp) => {
    const body = `
    <deleteToken xmlns="http://ejb3.examples.itko.com/">
      <token xmlns="">${req.body.token}</token>
    </deleteToken>`;

    const rspWS = await send(`${env.url}/TokenBean`, body);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    if (rspWS.statusCode == 200)
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:deleteTokenResponse'][0].return[0]
    else
        result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0];

    console.log('Delete Token: ' + result);
    console.log('--------------------------------------------------------------------');

    rsp.status(rspWS.statusCode).send({ result: result });
});

router.post('/listusers', async (req, rsp) => {
    const body = `<listUsers xmlns="http://ejb3.examples.itko.com/"/>`;

    const rspWS = await send(`${env.url}/EJB3UserControlBean`, body);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    if (rspWS.statusCode == 200)
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:listUsersResponse'][0].return
    else
        result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0];

    console.log('List Users...');
    console.log('--------------------------------------------------------------------');

    rsp.status(rspWS.statusCode).send({ result: result });
});

router.post('/transactions', async (req, rsp) => {
    const body = `
    <getTransactions xmlns="http://ejb3.examples.itko.com/">
        <accountId xmlns="">${req.body.accountID}</accountId>
        <from xmlns="">${req.body.from}</from>
        <to xmlns="">${req.body.to}</to>
    </getTransactions>`;

    const rspWS = await send(`${env.url}/EJB3AccountControlBean`, body, req.body.token);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    let status = 200;
    try {
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:getTransactionsResponse'][0].return
    }
    catch (error) {
        result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0]['env:Reason'][0]['env:Text'][0];
        status = 500;
    }

    console.log('Transactions...');
    console.log('--------------------------------------------------------------------');

    rsp.status(status).send({ result: result });
});

router.post('/account', async (req, rsp) => {
    const body = `
    <getAccount xmlns="http://ejb3.examples.itko.com/">
      <accountId xmlns="">${req.body.accountID}</accountId>
    </getAccount>`;

    const rspWS = await send(`${env.url}/EJB3AccountControlBean`, body, req.body.token);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    let status = 200;
    try {
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:getAccountResponse'][0].return
    }
    catch (error) {
        try {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0]
        }
        catch (error) {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0]['env:Reason'][0]['env:Text'];
        }

        status = 500;
    }

    console.log('Get Account...');
    console.log('--------------------------------------------------------------------');

    rsp.status(status).send({ result: result });
});

router.post('/deposit', async (req, rsp) => {
    const body = `
    <depositMoney xmlns="http://ejb3.examples.itko.com/">
      <accountId xmlns="">${req.body.accountID}</accountId>
      <amount xmlns="">${req.body.amount}</amount>
      <desc xmlns="">${req.body.desc}</desc>
    </depositMoney>`;

    const rspWS = await send(`${env.url}/EJB3AccountControlBean`, body, req.body.token);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    let status = 200;
    try {
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:depositMoneyResponse'][0].return
    }
    catch (error) {
        try {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0]
        }
        catch (error) {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0]['env:Reason'][0]['env:Text'];
        }

        status = 500;
    }

    console.log('Deposit...');
    console.log('--------------------------------------------------------------------');

    rsp.status(status).send({ result: result });
});

router.post('/withdraw', async (req, rsp) => {
    const body = `
    <withdrawMoney xmlns="http://ejb3.examples.itko.com/">
      <accountId xmlns="">${req.body.accountID}</accountId>
      <amount xmlns="">${req.body.amount}</amount>
      <desc xmlns="">${req.body.desc}</desc>
    </withdrawMoney>`;

    const rspWS = await send(`${env.url}/EJB3AccountControlBean`, body, req.body.token);
    const rspWSObj = await xml2js(rspWS.body);

    let result;
    let status = 200;
    try {
        result = rspWSObj['env:Envelope']['env:Body'][0]['ns2:withdrawMoneyResponse'][0].return
    }
    catch (error) {
        try {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0].faultstring[0]
        }
        catch (error) {
            result = rspWSObj['env:Envelope']['env:Body'][0]['env:Fault'][0]['env:Reason'][0]['env:Text'];
        }

        status = 500;
    }

    console.log('Withdraw...');
    console.log('--------------------------------------------------------------------');

    rsp.status(status).send({ result: result });
});

module.exports = router;