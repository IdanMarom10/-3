var Scorm = {
    api: null,
    initialized: false
};

function findAPI(win) {
    var attempts = 0;
    var maxAttempts = 10;

    while (!win.API && win.parent && win.parent !== win && attempts < maxAttempts) {
        attempts++;
        win = win.parent;
    }

    if (win.API) {
        return win.API;
    }

    if (!win.API && win.opener && win.opener !== win) {
        return findAPI(win.opener);
    }

    return null;
}

function getAPI() {
    if (Scorm.api !== null) {
        return Scorm.api;
    }

    Scorm.api = findAPI(window);
    return Scorm.api;
}

function doLMSInitialize() {
    var api = getAPI();
    if (api == null) {
        return "false";
    }

    var result = api.LMSInitialize("");
    if (result === "true") {
        Scorm.initialized = true;
    }
    return result;
}

function doLMSFinish() {
    var api = getAPI();
    if (api == null || !Scorm.initialized) {
        return "false";
    }

    var result = api.LMSFinish("");
    return result;
}

function doLMSSetValue(element, value) {
    var api = getAPI();
    if (api == null || !Scorm.initialized) {
        return "false";
    }

    var result = api.LMSSetValue(element, value);
    return result;
}

function doLMSCommit() {
    var api = getAPI();
    if (api == null || !Scorm.initialized) {
        return "false";
    }

    var result = api.LMSCommit("");
    return result;
}
