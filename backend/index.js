const express = require('express');
const app = express();

const jira = require('./routes/jira');
const jenkins = require('./routes/jenkins');
const cdd = require('./routes/cdd');

const deploy = require('./routes/deploy');
const backend = require('./routes/backend');

app.use(express.json());

app.use('/jira', jira);
app.use('/jenkins', jenkins);
app.use('/cdd', cdd);

app.use('/deploy', deploy);
app.use('/backend', backend);

const port = 8099;
app.listen(port, () => {
    console.log('Integration services are running...');
    console.log();
    console.log(`Waiting for requrest (port ${port})...`);
});