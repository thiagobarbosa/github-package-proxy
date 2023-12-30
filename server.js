require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const GITHUB_OWNER = 'YOUR_GITHUB_OWNER';
const GROUP_ID = 'YOUR_GROUP_ID';

app.get('*', async (req, res) => {
    try {
        // checks if path starts with GROUPID
        const pattern = new RegExp(`^\/${GROUP_ID}\/(.+)$`);

        const match = req.path.match(pattern);

        if (!match) {
            return res.status(404).send('Invalid path: ' + req.path);
        }

        // the '/pkg' is hardcoded and it seems to work with any value, even though
        // Github documentation says it should be the repository name;
        // this might change in the future
        const targetURL = `https://maven.pkg.github.com/${GITHUB_OWNER}/pkg${req.path}`;

        const response = await axios.get(targetURL, {
            headers: { 
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Host': 'maven.pkg.github.com'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 303;
            },
            maxRedirects: 0
        });

        // Check if the response is a redirect
        if (response.status === 302) {
            // Redirect user to the URL provided in the Location header
            const redirectUrl = response.headers.location;
            res.redirect(302, redirectUrl);
        } else {
            // Handle non-redirect responses
            res.set(response.headers);
            res.status(response.status).send(response.data);
        }
    } catch (error) {
        console.error(error);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : 'Unknown error');
    }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
