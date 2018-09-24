const path = require('path');
const rootPath = path.resolve(__dirname, '../../');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'project-base'
    },
    port: process.env.PORT || 1234,
    db: 'postgres://localhost/project-base-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'project-base'
    },
    port: process.env.PORT || 1234,
    db: 'postgres://localhost/project-base-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'project-base'
    },
    port: process.env.PORT || 1234,
    db: 'postgres://localhost/project-base-production'
  }
};

module.exports = config[env];
