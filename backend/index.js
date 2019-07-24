const config = require('./config/config.js')

const express = require('express');
const app = express();

const jira = require('./routes/jira');
const jenkins = require('./routes/jenkins');
const cdd = require('./routes/cdd');

const deploy = require('./routes/deploy');
const backend = require('./routes/backend');
const services = require('./routes/services');

app.use(express.json());
app.use(express.static('static'));

app.use('/api/jira', jira);
app.use('/api/jenkins', jenkins);
app.use('/api/cdd', cdd);

app.use('/api/deploy', deploy);
app.use('/api/backend', backend);
app.use('/api/services', services);

app.get('/jira', (req, res) => res.redirect(config.jira.url));
app.get('/jenkins', (req, res) => res.redirect(config.jenkins.url));
app.get('/cdd', (req, res) => res.redirect(config.cdd.url));

const port = 3500;
app.listen(port, () => {
    console.log(`Waiting for requrest (port ${port})...`);
});