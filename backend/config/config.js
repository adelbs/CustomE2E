const config = {
    jira: {
        url: 'http://localhost:8881',
        usr: 'admin',
        pwd: 'admin'
    },
    jenkins: {
        url: 'http://localhost:8080',
        usr: 'admin',
        pwd: 'admin'
    },
    cdd: {
        url: 'http://localhost:8187/cdd',
        apiUrl: '/cdd/design/00000000-0000-0000-0000-000000000000/v1',
        usr: 'superuser@ca.com',
        pwd: 'suser',
        apiParams: {
            releaseId: 1,
            applicationId: 2,
            applicationName: 'Lisa Bank'
        }
    }
    
}

module.exports = config;