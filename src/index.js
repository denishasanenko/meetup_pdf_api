const fs = require('fs');
const express = require('express');
const request = require('request');
const multiparty = require('multiparty');
const uuid = require('uuid/v1');
const PDFImage = require("pdf-image").PDFImage;

const app = express();

const port = process.env.APP_PORT || 3002;
const files_api = process.env.FILES_API;

app.post('/', async (req, res) => {
    const data = await processFile(req);
    res.json(data);
});

const processFile = (req) => {
    const form = new multiparty.Form();
    return new Promise((resolve) => {
        form.parse(req, async (err, fields, files) => {
            const ext = files.file[0].originalFilename.split(".").slice(-1)[0];
            const filename = './files/'+uuid()+"."+ext;
            fs.copyFileSync(files.file[0].path, filename);
            console.log(`File ${filename} loaded`);
            return resolve(imageFromPdf(filename));
        });
    });
}

const imageFromPdf = (filename) => {
    const pdfImage = new PDFImage(filename);
    return pdfImage.convertPage(0).then(function (imagePath) {
        return new Promise((resolve) => {
            request.post({
                    url:files_api,
                    formData: {file: fs.createReadStream(imagePath)}
                }, (err, httpResponse, body) => {
                    if (err) return console.error('upload failed:', err);
                    console.log(`File ${filename} processed`);
                    resolve(JSON.parse(body));
                });
            });
            return {filename: imagePath};
        });
}

app.listen(port, () =>  {
    console.log(`PDF API listening on port ${port}!`);
});