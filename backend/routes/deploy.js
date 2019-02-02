const express = require('express');
const router = express.Router();

const httpClient = require('../util/httpClient');

router.get('/time/:time', async (req, rsp) => {
    let time = req.params.time;
    time = Number(time);

    console.log(`Wait time: ${time}`);

    await new Promise(resolve => setTimeout(resolve, time));
    rsp.send(String(time));
});

router.get('/upgrade', async (req, rsp) => {
    console.log(`upgrade`);

    rsp.send('ok');
});

module.exports = router;