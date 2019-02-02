$(function () {
    $.get("/services/status", function (data) {
        data.forEach(service => {
            var newLine = $(`<tr class='${service.tags}'></tr>`);
            newLine.append(`<td>${service.name}</td>`);
            newLine.append(`<td>${description(service.description)}</td>`);
            newLine.append(`<td class='status srv-${service.id}'>${status(service.id, service.status)}</td>`);
            newLine.append(`<td class='action srv-${service.id}'>${actions(service.id, service.status, service.service, service.url)}</td>`);

            $('table tbody').append(newLine);
        });

        update();
        setInterval(() => update(), 10000);
    });
});

function update() {
    $.get("/services/update", function (data) { });
    $.get("/services/status", function (data) {
        data.forEach(service => {
            $(`.status.srv-${service.id}`).empty();
            $(`.status.srv-${service.id}`).append(status(service.id, service.status));
            $(`.action.srv-${service.id}`).empty();
            $(`.action.srv-${service.id}`).append(actions(service.id, service.status, service.service, service.url));
        });
    });
}

function status(id, status) {
    var result = '';

    if (status == 'RUNNING')
        result += '<img src="green.png" title="Running"/>';
    else if (status == 'STOPPED')
        result += '<img src="red.png" title="Stopped"/>';
    else
        result += `<img src="yellow.png" title="${status}"/>`;

    return result;
}

function actions(id, status, service, url) {
    var result = '';

    if (status == 'RUNNING') {
        if (service != '') result += `<button onclick='stopService(${id})'>Stop</button>`;
        if (url != '') result += `<button onclick='openUrl("${url}")'>Open</button>`;
    }
    else if (status == 'STOPPED' && service != '') {
        result += `<button onclick='startService(${id})'>Start</button>`;
    }
    else {
        if (service != '') {
            result += `<button onclick='startService(${id})'>Start</button>`;
            result += `<button onclick='stopService(${id})'>Stop</button>`;
        }

        if (url != '')
            result += `<button onclick='openUrl("${url}")'>Open</button>`;
    }

    return result;
}

function description(desc) {
    var result = desc;
    while (result.indexOf('\n') > -1)
        result = result.replace('\n', '<br>');
    return result;
}

function startService(id) {
    $.get(`/services/start/${id}`, function (data) {
        $(`.status.srv-${id}`).empty();
        $(`.status.srv-${id}`).append(status(id, 'Starting'));
        $(`.action.srv-${id}`).empty();
    });
}

function stopService(id) {
    $.get(`/services/stop/${id}`, function (data) {
        $(`.status.srv-${id}`).empty();
        $(`.status.srv-${id}`).append(status(id, 'Stopping'));
        $(`.action.srv-${id}`).empty();
    });
}

function openUrl(url) {
    window.open(url);
}

function filter(tag) {
    if (tag != '') {
        $('tbody tr').hide();
        $(`.${tag}`).show();
    }
    else {
        $('tbody tr').show();
    }
}