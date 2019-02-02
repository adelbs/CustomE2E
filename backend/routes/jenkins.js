const express = require('express');
const router = express.Router();

const httpClient = require('../util/httpClient');

router.post('/cdd', async (req, rsp) => {

    const resCreateVersion = await httpClient.send('POST',
        `http://localhost:8082/cdd/design/00000000-0000-0000-0000-000000000000/v1/releases/3/application-versions?force=true`,
        true,
        {
            "className": "ApplicationVersionDto",
            "name": req.body.releaseVersion,
            "application": {
                "className": "ApplicationDto",
                "id": 2,
                "name": "LisaBank",
                "deletable": true,
                "sourceName": "Local",
                "applicationVersions": null,
                "oldName": null
            },
            "isOpened": false
        }, 'superuser@ca.com', 'suser');

    const resCreateContent = await httpClient.send('POST',
        `http://localhost:8082/cdd/design/00000000-0000-0000-0000-000000000000/v1/releases/3/application-versions/${resCreateVersion.body.data.id}/content-sources`,
        true,
        {
            "className": "ContentSourceDto",
            "name": "Jira",
            "pluginService": {
                "className": "PluginServiceDto",
                "name": "Jira",
                "parameters": [{
                    "className": "PluginServiceParameterDto",
                    "templateParameterId": 54,
                    "value": `project = LisaBank AND fixVersion = ${req.body.releaseVersion}`
                }],
                "templateId": 20,
                "endpoint": {
                    "className": "EndpointDto",
                    "id": 2,
                    "lastConnectivityStatus": "CONNECTED",
                    "lastConnectivityTestDate": 1537853414000,
                    "connectivityArguments": [],
                    "name": "Jira",
                    "pluginService": {
                        "className": "PluginServiceDto",
                        "id": 2,
                        "parameters": [{
                            "className": "PluginServiceParameterDto",
                            "id": 3,
                            "templateParameterId": 22,
                            "value": "http://localhost:8085"
                        },
                        {
                            "className": "PluginServiceParameterDto",
                            "id": 4,
                            "templateParameterId": 23,
                            "value": "adelbs"
                        },
                        {
                            "className": "PluginServiceParameterDto",
                            "id": 5,
                            "templateParameterId": 24,
                            "value": "A765F538B164A230"
                        }, {
                            "className": "PluginServiceParameterDto",
                            "id": 6,
                            "templateParameterId": 25,
                            "value": "false"
                        }],
                        "templateId": 13,
                        "plugin": {
                            "className": "PluginDto",
                            "id": 4,
                            "name": "Jira",
                            "description": "Plugin for CA Jira",
                            "version": "1.2",
                            "iconUrl": "Jira.svg",
                            "discoveryUrl": "http://localhost:8082/cdd-jira-plugin/manifest.json",
                            "content": true,
                            "testSource": false,
                            "applicationModel": false,
                            "connectivityTest": true,
                            "numOfTasks": 4,
                            "lastSync": 1544103541000,
                            "visible": false,
                            "vendor": "CA Technologies",
                            "isUseProxy": false,
                            "endpointTemplate": null
                        },
                        "templateName": "Jira",
                        "isMissingParameters": false
                    },
                    "type": "ENDPOINT",
                    "inUse": false,
                    "applications": [],
                    "environments": []
                }
            },
            "isSyncing": false
        }, 'superuser@ca.com', 'suser');

    const tokenRun = await httpClient.send('PUT',
        `http://localhost:8082/cdd/design/00000000-0000-0000-0000-000000000000/v1/releases/3/tokens/9`,
        true,
        {
            "className": "ReleaseTokenDto",
            "id": 9,
            "name": "version",
            "release": {
                "className": "IdentifiableDto",
                "id": 3
            },
            "value": req.body.releaseVersion,
            "isSystem": false,
            "scope": "PHASE_SCOPE"
        }, 'superuser@ca.com', 'suser');

    const resRun = await httpClient.send('PATCH',
        `http://localhost:8082/cdd/execution/00000000-0000-0000-0000-000000000000/v1/releases-execution/3/phases-execution/5`,
        true,
        { "className": "PhaseExecutionDto", "status": "RUNNING" }, 'superuser@ca.com', 'suser');

    rsp.send('ok');
});

module.exports = router;