'use strict';

function displayCurrentProxyConfiguration() {
    chrome.proxy.settings.get(
        { 'incognito': false },
        function (cfg) {
            const lblCurrentCfg = document.getElementById('lblCurrentConfiguration');
            lblCurrentCfg.innerText = JSON.stringify(cfg, null, 4);
        }
    )
}

displayCurrentProxyConfiguration();

function initializeConfiguration() {
    chrome.storage.local.get(['proxy'], function (cfg) {
        if (cfg.proxy === null || cfg.proxy === undefined)
            return;

        document.getElementById('tbServer').value = cfg.proxy.server;
        document.getElementById('tbPort').value = cfg.proxy.port;

        let bypassList;

        if (cfg.proxy.bypassList !== null && cfg.proxy.bypassList !== undefined) {
            if (cfg.proxy.bypassList.length === 0) {
                bypassList = '';
            }
            else {
                bypassList = cfg.proxy.bypassList.join('\n');
            }
        }
        else {
            let defaultBypassList = ['localhost', '127.0.0.1', '::1'];
            bypassList = defaultBypassList.join('\n');
        }

        document.getElementById('tbBypassList').value = bypassList;
    });
}

initializeConfiguration();

const btnSet = document.getElementById('btnSet');

btnSet.onclick = function () {
    const server = document.getElementById('tbServer').value;
    const port = document.getElementById('tbPort').value;
    let bypassList = document.getElementById('tbBypassList').value.trim();
    let bypassListArray = [];

    if (bypassList !== '') {
        let bypassItems = bypassList.split('\n');
        bypassItems.forEach(item => {
            let trimmedItem = item.trim();

            if (trimmedItem !== '') {
                bypassListArray.push(trimmedItem);
            }
        });
    }

    let proxyCfg = {
        mode: 'fixed_servers',
        rules: {
            singleProxy: {
                scheme: 'socks5',
                host: server,
                port: parseInt(port)
            },
            bypassList: bypassListArray
        }
    };

    chrome.proxy.settings.set(
        { value: proxyCfg, scope: 'regular' },
        function () {
            displayCurrentProxyConfiguration();
        }
    );

    chrome.storage.local.set({
        proxy: {
            server: server,
            port: port,
            bypassList: bypassListArray
        }
    });

    chrome.browserAction.setIcon({
        path: {
            "128": 'icons/global_on_128.png'
        }
    }, function() {});

    setMessage('Done".');
}

const btnClear = document.getElementById('btnClear');
btnClear.onclick = function () {
    let proxyCfg = {
        mode: 'system'
    }

    chrome.proxy.settings.set({
        value: proxyCfg,
        scope: 'regular'
    }, function () {
        setMessage('Proxy configuration is reset to "system".');
        displayCurrentProxyConfiguration();
    });

    chrome.browserAction.setIcon({
        path: {
            "128": 'icons/global_off_128.png'
        }
    }, function() {});
}

function setMessage(msg) {
    const lblMsg = document.getElementById('lblMsg');
    lblMsg.innerText = msg;
    clearMessage();
}

function clearMessage() {
    window.setTimeout(function () {
        const lblMsg = document.getElementById('lblMsg');
        lblMsg.innerText = '';
    }, 2000);
}