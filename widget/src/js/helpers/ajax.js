const ajax = function(method, url, params = {}, then = null) {
    const api = window.XMLHttpRequest;
    const xhr = new api;

    if (method === 'GET') {
        const encode = encodeURIComponent;

        const query = Object.keys(params).map(key => {
            const value = params[key];
            return encode(key) + '=' + encode(value);
        }).join('&');

        url += '?' + query;
    }

    xhr.onreadystatechange = function() {
        const { readyState, status } = xhr;

        if (readyState === api.DONE && then) {
            if (status === 0 || status === 200) {
                let response;

                try {
                    response = JSON.parse(xhr.responseText);
                } catch {
                    response = null;
                }

                then(response);
            } else {
                then(null);
            }
        }
    };

    xhr.open(method, url, true);

    if (method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify(params));
    } else {
        xhr.send();
    }
};
