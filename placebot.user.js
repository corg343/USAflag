// ==UserScript==
// @name         r/placeDE Zinnsoldat
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  One of us!
// @author       placeDE Devs
// @match        https://*.reddit.com/r/place/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @updateURL    https://github.com/PlaceDE-Official/zinnsoldat/raw/main/output/placebot.user.js
// @downloadURL  https://github.com/PlaceDE-Official/zinnsoldat/raw/main/output/placebot.user.js
// ==/UserScript==

(async () => {
    // Check for the correct page
    if (!window.location.href.startsWith('https://www.reddit.com/r/place/') && !window.location.href.startsWith('https://new.reddit.com/r/place/')) {
        return;
    }

    // Check for marker; only load the script once!
    if (document.head.querySelector('meta[name="zinnsoldat"]')) {
        console.warn('Script already loaded!');
        return;
    }
    const marker = document.createElement('meta');
    marker.setAttribute('name', 'zinnsoldat');
    document.head.appendChild(marker);

    // Styles for the User Interface
    const zs_style = document.createElement('style');
    zs_style.innerHTML = `
        .zs-hidden {
            display: none;
        }
        .zs-pixeled {
            border: 3px solid #000000;
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.75);
            font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif;
            font-weight: 600;
        }
        .zs-button {
            position: fixed;
            width: 142px;
            height: 46px;
            bottom: 15px;
            left: 15px;
            z-index: 100;
            color: #fff;
        }
        .zs-startbutton {
            background-color: #FF4500;
        }
        .zs-startbutton:hover {
            background-color: #e63d00;
        }
        .zs-stopbutton {
            background-color: #00A368;
        }
        .zs-stopbutton:hover {
            background-color: #008f5b;
        }
        .zs-timeout {
            position: fixed;
            left: 50%;
            margin-left: -90px;
            bottom: 28px;
            width: 180px;
            height: 46px;
            background: linear-gradient(-90deg, rgb(42, 60, 66) var(--zs_timeout), rgb(87, 111, 118) var(--zs_timeout));
            z-index: 100;
        }
    `;
    document.head.appendChild(zs_style);

    // Variables for controlling the script
    let zs_running = true;
    let zs_initialized;
    let placeTimeout;

    const zs_version = "0.3";

    // Create the Start/Stop button for the User Interface
    const zs_startButton = document.createElement('button');
    zs_startButton.innerText = `Zinnsoldat v${zs_version}`;
    zs_startButton.classList.add('zs-pixeled', 'zs-button', 'zs-stopbutton');
    document.body.appendChild(zs_startButton);

    // Create the timeout bar for the User Interface
    const zs_timeout = document.createElement('div');
    zs_timeout.classList.add('zs-pixeled', 'zs-timeout');
    zs_timeout.style.setProperty('--zs_timeout', '100%');
    document.body.appendChild(zs_timeout);

    // Load Toastify library for showing notifications
    await new Promise((resolve, reject) => {
        // Load the Toastify CSS
        var toastifyStyle = document.createElement('link');
        toastifyStyle.type = "text/css";
        toastifyStyle.rel = "stylesheet";
        toastifyStyle.media = "screen";
        toastifyStyle.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
        document.head.appendChild(toastifyStyle);
        
        // Load the Toastify JS
        var toastifyScript = document.createElement('script');
        toastifyScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/toastify-js');
        toastifyScript.setAttribute('async', false);
        document.body.appendChild(toastifyScript);
        
        // Resolve the promise when the script is loaded
        toastifyScript.addEventListener('load', (ev) => {
            resolve({ status: true });
        });
        toastifyScript.addEventListener('error', (ev) => {
            reject({ status: false, message: `Failed to load the toastify` });
        });
    });

    // Functions for displaying different types of notifications
    const zs_info = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#383838',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_warn = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#FFA800',
                color: '#000',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_error = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#d93a00',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_success = (msg) => {
        Toastify({
            text: msg,
            duration: 5000,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#00A368',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }
    const zs_updateNotification = () => {
        Toastify({
            text: 'New version available at https://place.army/!',
            destination: 'https://place.army/',
            duration: -1,
            gravity: 'bottom',
            position: 'right',
            stopOnFocus: true,
            className: 'zs-pixeled',
            style: {
                background: '#3690EA',
                color: '#fff',
                'box-shadow': '8px 8px 0px rgba(0, 0, 0, 0.75)',
            },
        }).showToast();
    }

    zs_info('One of us!');

    // Override setTimeout to allow getting the time left for the next job
    const _setTimeout = setTimeout;
    const _clearTimeout = clearTimeout;
    const zs_allTimeouts = {};

    setTimeout = (callback, delay) => {
        let id = _setTimeout(callback, delay);
        zs_allTimeouts[id] = Date.now() + delay;
        return id;
    };

    clearTimeout = (id) => {
        _clearTimeout(id);
        zs_allTimeouts[id] = undefined;
    }

    const getTimeout = (id) => {
        if (zs_allTimeouts[id]) {
            return Math.max(
                zs_allTimeouts[id] - Date.now(),
                0 // Make sure we get no negative values for timeouts that are already done
            );
        }

        return NaN;
    }

    // Update the progress bar based on the time left for the next job
    setInterval(() => {
        const theTimeout = getTimeout(placeTimeout);
        if (Number.isNaN(theTimeout)) {
            // Hide the progress bar
            zs_timeout.style.opacity = 0;
        }

        // Show the progress bar
        zs_timeout.style.opacity = 1;

        // Update the percentage for the progress bar
        const maxTimeout = 300000; // 5 minutes
        const percentage = 100 - Math.min(Math.max(Math.round((theTimeout / maxTimeout) * 100), 0), 100);
        zs_timeout.style.setProperty("--zs_timeout", `${percentage}%`);
    }, 1);

    // Retrieve access token from Reddit to interact with the canvas
    const zs_getAccessToken = async () => {
        const usingOldReddit = window.location.href.includes('new.reddit.com');
        const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
        const response = await fetch(url);
        const responseText = await response.text();

        return responseText.match(/"accessToken":"(\\"|[^"]*)"/)[1];
    };

    zs_info('Requesting access to Reddit...');
    let zs_accessToken = await zs_getAccessToken();
    zs_success('Access granted!');

    // Functions to map canvas coordinates to canvas IDs, X, and Y positions
    const zs_getCanvasId = (x, y) => {
        if (y < 0 && x < 500) {
            return 1;
        } else if (y < 0 && x >= 500) {
            return 2;
        } else if (y >= 0 && x < 500) {
            return 4;
        } else if (y >= 0 && x >= 500) {
            return 5;
        }
        console.error('Unknown canvas!');
        return 0;
    };

    const zs_getCanvasX = (x, y) => {
        return (x + 500) % 1000;
    };

    const zs_getCanvasY = (x, y) => {
        return zs_getCanvasId(x, y) < 3 ? y + 1000 : y;
    };

    // Function to place a pixel on the canvas using GraphQL requests to Reddit's server
    const zs_placePixel = async (x, y, color) => {
        console.log('Trying to place a pixel at %s, %s in color %s', x, y, color);
        const response = await fetch('https://gql-realtime-2.reddit.com/query', {
            method: 'POST',
            body: JSON.stringify({
                'operationName': 'setPixel',
                'variables': {
                    'input': {
                        'actionName': 'r/replace:set_pixel',
                        'PixelMessageData': {
                            'coordinate': {
                                'x': zs_getCanvasX(x, y),
                                'y': zs_getCanvasY(x, y)
                            },
                            'colorIndex': color,
                            'canvasIndex': zs_getCanvasId(x, y)
                        }
                    }
                },
                'query': `mutation setPixel($input: ActInput!) {
                    act(input: $input) {
                        data {
                            ... on BasicMessage {
                                id
                                data {
                                    ... on GetUserCooldownResponseMessageData {
                                        nextAvailablePixelTimestamp
                                        __typename
                                    }
                                    ... on SetPixelResponseMessageData {
                                        timestamp
                                        __typename
                                    }
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                }
                `
            }),
            headers: {
                'origin': 'https://garlic-bread.reddit.com',
                'referer': 'https://garlic-bread.reddit.com/',
                'apollographql-client-name': 'garlic-bread',
                'Authorization': `Bearer ${zs_accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.errors !== undefined) {
            if (data.errors[0].message === 'Ratelimited') {
                console.log('Could not place a pixel at %s, %s in color %s - Ratelimit', x, y, color);
                zs_warn('You have a cooldown time!');
                return data.errors[0].extensions?.nextAvailablePixelTs;
            }
            console.log('Could not place a pixel at %s, %s in color %s - Response error', x, y, color);
            console.error(data.errors);
            zs_error('Error placing the pixel');
            return null;
        }
        console.log('Placed a pixel at %s, %s in color %s', x, y, color);
        zs_success(`Pixel (${x}, ${y}) placed!`);
        return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
    };

    let c2;
    let tokens = ['Wololo']; // We only have one token

    // Function to request jobs from the "Carpetbomber" server
    const zs_requestJob = () => {
        if (c2.readyState !== c2.OPEN) {
            zs_error('Connection to "Carpetbomber" lost. Reconnecting...');
            zs_initCarpetbomberConnection();
            return;
        }
        if (!zs_running) {
            return;
        }
        c2.send(JSON.stringify({ type: "RequestJobs", tokens: tokens }));
    };

    // Function to process the response with pixel placement jobs from the "Carpetbomber" server
    const zs_processJobResponse = (jobs) => {
        if (!jobs || Object.keys(jobs).length === 0) {
            zs_warn('No available jobs. Trying again in 60s');
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, 60000);
            return;
        }
        let [token, [job, code]] = Object.entries(jobs)[0];
        if (!job) {
            // Check if ratelimited and schedule a retry
            const ratelimit = code?.Ratelimited?.until;
            if (ratelimit) {
                clearTimeout(placeTimeout);
                placeTimeout = setTimeout(() => {
                    zs_requestJob();
                }, Math.max(5000, Date.parse(ratelimit) + 2000 - Date.now()));
                return;
            }
            // Other error. No jobs left?
            zs_warn('No available jobs. Trying again in 20s');
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, 20000);
            return;
        }
        // Execute the job
        zs_placePixel(job.x, job.y, job.color - 1).then((nextTry) => {
            clearTimeout(placeTimeout);
            placeTimeout = setTimeout(() => {
                zs_requestJob();
            }, Math.max(5000, (nextTry || 5 * 60 * 1000) + 2000 - Date.now()));
        });
    };

    // Function to initialize the WebSocket connection to the "Carpetbomber" server
    const zs_initCarpetbomberConnection = () => {
        c2 = new WebSocket("wss://carpetbomber.place.army");

        c2.onopen = () => {
            zs_initialized = true;
            zs_info('Connecting to "Carpetbomber"...');
            c2.send(JSON.stringify({ type: "Handshake", version: zs_version }));
            zs_requestJob();
            setInterval(() => c2.send(JSON.stringify({ type: "Wakeup" })), 40 * 1000);
        };

        c2.onerror = (error) => {
            zs_error('Connection to "Carpetbomber" failed! Trying again in 5s');
            console.error(error);
            setTimeout(zs_initCarpetbomberConnection, 5000);
        };

        c2.onmessage = (event) => {
            data = JSON.parse(event.data);
            // console.log('received: %s', JSON.stringify(data));

            if (data.type === 'UpdateVersion') {
                zs_success('Connection established!');
                if (data.version > zs_version) {
                    zs_updateNotification();
                }
            } else if (data.type == "Jobs") {
                zs_processJobResponse(data.jobs);
            }
        };
    };

    // Start the WebSocket connection
    zs_initCarpetbomberConnection();

    // Function to start the bot and request jobs
    const zs_startBot = () => {
        zs_running = true;
        zs_startButton.classList.remove('zs-startbutton');
        zs_startButton.classList.add('zs-stopbutton');
        zs_timeout.classList.remove('zs-hidden');
        if (zs_initialized) {
            zs_requestJob();
        }
    };

    // Function to stop the bot
    const zs_stopBot = () => {
        zs_running = false;
        clearTimeout(placeTimeout);
        zs_startButton.classList.remove('zs-stopbutton');
        zs_startButton.classList.add('zs-startbutton');
        zs_timeout.classList.add('zs-hidden');
    };

    // Add click event listener to the Start/Stop button
    zs_startButton.onclick = () => {
        if (zs_running) {
            zs_stopBot();
        } else {
            zs_startBot();
        }
    };
})();
