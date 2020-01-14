const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const config = require('./webpack.config.dev.js');
const compiler = webpack(config);

app.use(webpackHotMiddleware(compiler, {
    log: false
}));

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.listen(3000, () => {
    console.log('Example app listening on port 3000');
})