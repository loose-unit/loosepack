/* eslint-disable no-undef,@typescript-eslint/no-var-requires,@typescript-eslint/no-empty-function */

const prefixRE = /^VUE_APP_/;
const dotenv = require('dotenv');

let ARGS = null;

const Env = {
  setArgsFromWebpackEnv(args) {
    ARGS = args;
  },

  loadConfig(dotenvFile) {
    dotenvFile = dotenvFile || this.arg('dotenv', '.env')
    dotenv.config({
      path: dotenvFile, 
      encoding: 'utf8' 
    });
    return process.env;
  },

  vueEnv() {
    const env = {};
    Object.keys(process.env).forEach((key) => {
      if (prefixRE.test(key) || key === 'NODE_ENV') {
        env[key] = process.env[key];
      }
    });

    for (const key in env) {
      env[key] = JSON.stringify(env[key]);
    }
    return {
      'process.env': env,
    };
  },

  env(name, defaultValue = null) {
    // console.log(`CONFIG!!!! ${name}`);
    if (process.env[name]) {
      // console.log(` - found: ${process.env[name]}`);
      return process.env[name];
    }
    return defaultValue;
  },

  arg(argName, defaultVal = '') {
    if (ARGS[argName]) {
      return ARGS[argName];
    }

    return defaultVal;
  },
  // Depreciated ... use method setArgsFromWebpackEnv
  setArgsFromProcess() {
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
  },

  // Depreciated ... use method setArgsFromWebpackEnv
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
};

module.exports = Env;
