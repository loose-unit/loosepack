/* eslint-disable no-undef,@typescript-eslint/no-var-requires,@typescript-eslint/no-empty-function */

const prefixRE = /^VUE_APP_/;
const dotenv = require('dotenv');
const fs = require('fs');

let ARGS = null;

let loadedConfig = {};

const Env = {
  arg(argName, defaultVal = '') {
    if (ARGS === null) {
      ARGS = {};
      process.argv.forEach((s) => {
        if (s.indexOf('=') > 0) {
          s = s.replace('--', '');
          const argc = s.split('=');
          ARGS[argc[0]] = argc[1];
        }
      });
    }

    if (ARGS[argName]) {
      return ARGS[argName];
    }

    return defaultVal;
  },

  processArgs() {
    const args = {};
    let arg = JSON.parse(process.env.npm_config_argv).original[1];
    if (arg) {
      arg = arg.replace('--', '');
      arg.split(' ').map((argv) => {
        const argc = argv.split('=');
        args[argc[0]] = argc[1];
      });
    }

    return args;
  },

  loadConfig(dotenvFile, envDefaults) {
    // console.log('LOADED');
    loadedConfig = { ...envDefaults, ...dotenv.parse(fs.readFileSync(dotenvFile, { encoding: 'utf8' })) };
    return loadedConfig;
  },

  vueEnv(raw) {
    const env = {};
    Object.keys(loadedConfig).forEach((key) => {
      if (prefixRE.test(key) || key === 'NODE_ENV') {
        env[key] = loadedConfig[key];
      }
    });

    if (raw) {
      return env;
    }

    for (const key in env) {
      env[key] = JSON.stringify(env[key]);
    }
    return {
      'process.env': env,
    };
  },

  config(name, defaultValue = null) {
    // console.log(`CONFIG!!!! ${name}`);
    if (loadedConfig[name]) {
      // console.log(` - found: ${loadedConfig[name]}`);
      return loadedConfig[name];
    }
    return defaultValue;
  },
};

module.exports = Env;
