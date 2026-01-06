import * as express from 'express';

export const setupDev = (app: express.Express, developmentMode: boolean): void => {
  if (developmentMode) {
    const webpackDev = require('webpack-dev-middleware');
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config');
    const compiler = webpack(webpackConfig);
    app.use(
      webpackDev(compiler, {
        publicPath: '/',
      })
    );
  }
};

module.exports = { setupDev };
