const { Octokit } = require("@octokit/rest");
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const owner = 'your-github-username';
const repo = 'your-github-repo';

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const form = new multiparty.Form();
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const file = files.image[0];
            const buffer = fs.readFileSync(file.path);
            const fileName = randomBytes(16).toString('hex') + path.extname(file.originalFilename);
            const filePath = `yeah/${fileName}`;
            const content = buffer.toString('base64');

            try {
                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: filePath,
                    message: `Upload image ${fileName}`,
                    content,
                });
                const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
                res.status(200).json({ success: true, url: imageUrl });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
};
