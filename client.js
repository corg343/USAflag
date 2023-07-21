(async () => {
    var REDDIT_TOKEN = "";


    if (!window.location.href.startsWith('https://www.reddit.com/r/place/') && !window.location.href.startsWith('https://new.reddit.com/r/place/')) {
        return alert("Cannot load script outside of r/palce");
    }
    if (document.head.querySelector('meta[name="FUCKING AMERICAAAA"]')) {
        return alert("Script already loaded solider!");
    }
    const marker = document.createElement('meta');
    marker.setAttribute('name', 'FUCKING AMERICAAAA');
    document.head.appendChild(marker);

    const getRedditToken = async () => {
        const usingOldReddit = window.location.href.includes('new.reddit.com');
        const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
        const response = await fetch(url);
        const responseText = await response.text();

        return REDDIT_TOKEN = responseText.match(/"accessToken":"(\\"|[^"]*)"/)[1];
    };
});