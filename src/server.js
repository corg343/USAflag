const WebSocket = require('ws');
const fs = require('fs');
const PNG = require('pngjs').PNG;

const wss = new WebSocket.Server({ port: 8080 });

var jobs = [];

fs.createReadStream('input.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {
        let jobs = [];
        let startingX = -186;
        let startingY = 175;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let idx = (this.width * y + x) << 2;

                let red = this.data[idx];
                let green = this.data[idx+1];
                let blue = this.data[idx+2];
                let alpha = this.data[idx+3];

                jobs.push({
                    x: x + startingX,
                    y: y + startingY,
                    color: [red, green, blue, alpha]
                });
            }
        }
    });

wss.on('connection', ws => {
    console.log('New connection');

    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'RequestJobs') {
            let responseJobs = {};

            // Loop over requested tokens and assign jobs
            data.tokens.forEach(token => {
                // If we have a job for the token, assign it and remove from our jobs list
                if (jobs[token]) {
                    responseJobs[token] = [jobs[token].shift(), null];

                    // If no more jobs for this token, remove it
                    if (jobs[token].length === 0) {
                        delete jobs[token];
                    }
                }
            });

            // Send response to the client
            ws.send(JSON.stringify({ type: 'JobResponse', jobs: responseJobs }));
        }
    });
});

console.log('Server started on ws://localhost:8080');