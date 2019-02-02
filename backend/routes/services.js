const express = require('express');
const router = express.Router();

const cmd = require('child_process');

const services = [
    {
        id: 0,
        name: 'LisaBank',
        description: 'Must execute the DevTest Demo Server\nUser: admin\nPwd: admin',
        service: '',
        status: 'UNKNOWN',
        url: 'http://localhost:8180/lisabank',
        tags: 'demoApp main'
    },
    {
        id: 1,
        name: 'DevTest Enterprise Dashboard',
        description: 'User: admin\nPwd: admin',
        service: 'DevTest Enterprise Dashboard Service',
        status: 'UNKNOWN',
        url: 'http://localhost:1506',
        tags: 'SV'
    },
    {
        id: 2,
        name: 'DevTest IAM',
        description: 'User: admin\nPwd: admin',
        service: 'IdentityAccessManager Service',
        status: 'UNKNOWN',
        url: 'http://localhost:51111',
        tags: 'SV'
    },
    {
        id: 3,
        name: 'DevTest Registry',
        description: '',
        service: 'DevTest Registry Service',
        status: 'UNKNOWN',
        url: '',
        tags: 'SV'
    },
    {
        id: 4,
        name: 'DevTest VSE',
        description: '',
        service: 'DevTest VSE Service',
        status: 'UNKNOWN',
        url: '',
        tags: 'SV'
    },
    {
        id: 5,
        name: 'DevTest Portal',
        description: 'User: admin\nPwd: admin',
        service: 'DevTest Portal Service',
        status: 'UNKNOWN',
        url: 'http://localhost:1507',
        tags: 'SV main'
    },
    {
        id: 6,
        name: 'Jira',
        description: 'User: administrator\nPwd: CAdemo123',
        service: 'JIRASoftware010219113933',
        status: 'UNKNOWN',
        url: 'http://localhost:8085',
        tags: 'Jira main'
    },
    {
        id: 7,
        name: 'Jenkins',
        description: 'User: admin\nPwd: admin',
        service: 'Jenkins',
        status: 'UNKNOWN',
        url: 'http://localhost:8084',
        tags: 'Jenkins main'
    },
    {
        id: 8,
        name: 'Automic',
        description: 'IIS must be running!\nClient: 100\nUser: AUTOMIC\nDepartment: AUTOMIC\nPwd: CAdemo123',
        service: '',
        status: 'UNKNOWN',
        url: 'http://localhost/cda',
        tags: 'CDA main'
    },
    {
        id: 9,
        name: 'CDD',
        description: 'User: superuser@ca.com\nPwd: suser',
        service: 'CA-CDD',
        status: 'UNKNOWN',
        url: 'http://localhost:8082/cdd',
        tags: 'CDD main'
    },
    {
        id: 10,
        name: 'TDM Remote Publish',
        description: '',
        service: 'DMBatch.exe',
        status: 'UNKNOWN',
        url: '',
        tags: 'TDM'
    },
    {
        id: 11,
        name: 'TDM TDoD',
        description: '',
        service: 'GTWCFHOST.exe',
        status: 'UNKNOWN',
        url: '',
        tags: 'TDM'
    },
    {
        id: 12,
        name: 'TDM Portal',
        description: 'User: Administrator\nPwd: marmite',
        service: 'CATestDataManagerPortal',
        status: 'UNKNOWN',
        url: 'http://localhost:8088',
        tags: 'TDM main'
    },
    {
        id: 13,
        name: 'TDM OrientDB',
        description: '',
        service: 'OrientDB',
        status: 'UNKNOWN',
        url: '',
        tags: 'TDM'
    }
];

function updateServicesStatus() {
    services.forEach(service => {
        cmd.exec(`sc query "${service.service}"`, (err, out, outErr) => {
            if (out.indexOf('RUNNING') > -1)
                service.status = 'RUNNING';
            else if (out.indexOf('STOPPED') > -1)
                service.status = 'STOPPED';
            else 
                service.status = 'UNKNOWN';
        });
    });
}

function startService(id) {
    services.forEach(service => {
        if (service.id == id) {
            cmd.exec(`net start "${service.service}"`, (err, out, outErr) => {
                if (outErr != null && outErr != '')
                    service.status = outErr;
                else
                    service.status = 'RUNNING';
            });
        }
    });
}

function stopService(id) {
    services.forEach(service => {
        if (service.id == id) {
            cmd.exec(`net stop "${service.service}"`, (err, out, outErr) => {
                if (outErr != null && outErr != '')
                    service.status = outErr;
                else
                    service.status = 'STOPPED';
            });
        }
    });
}

router.get('/status', async (req, rsp) => {
    rsp.send(services);
});

router.get('/update', async (req, rsp) => {
    updateServicesStatus();
    rsp.send('Updating...');
});

router.get('/start/:id', async (req, rsp) => {
    startService(req.params.id);
    rsp.send('Starting...');
});

router.get('/stop/:id', async (req, rsp) => {
    stopService(req.params.id);
    rsp.send('Stopping...');
});

module.exports = router;