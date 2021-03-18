const path = require('path');
const webpack = require('webpack');
const EnvPlugin = require('./libs/env.js');

class LoosePackWorker {
    _webpackConfig = {};

    constructor (env, arg) {
        console.log(env);
        console.log(arg);

        console.log (path.resolve(__dirname, 'dist'));

        this._env = EnvPlugin;

        this._webpackConfig = {
            mode: 'development',

            entry: {
                app: './src/app.ts',
            },
            output: {
                filename: '[name].[fullhash].js',
                path: './dist',
                publicPath: '/',
            },
            plugins: [
                // new webpack.DefinePlugin(EnvPlugin.vueEnv()),
            ],
            module: {
                rules: [
                ],
            },
            resolve: {
                alias: {
                    '@app': './src',
                    // '@core': path.resolve(__dirname, 'src/@core'),
                    // '@riptide': path.resolve(__dirname, 'src/@riptide'),
                },
                extensions: ['.tsx', '.ts', '.js', '.vue'],
            },
        
            performance: {
                maxEntrypointSize: 1000000,
                maxAssetSize: 1000000,
            },
        };
    }

    setMode(mode) {
        this._webpackConfig.mode = mode;
        return this;
    }

    setOutputPath(path) {
        this._webpackConfig.output.path = path;
        return this;
    }

    setEntry (entry) {
        this._webpackConfig.entry = entry;
        return this;
    }

    setAlias (alias) {
        this._webpackConfig.resolve.alias = alias;
        return this;
    }

    addPluginClean () {
        const {CleanWebpackPlugin} = require('clean-webpack-plugin');
        
        const plugin = new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', '!.gitignore'] })
        
        this._webpackConfig.plugins.push (plugin);
        
        return this;
    }

    addPluginHtml (template) {
        const HtmlWebpackPlugin = require('html-webpack-plugin');

        const plugin = new HtmlWebpackPlugin({
          template: template
        });
        
        this._webpackConfig.plugins.push (plugin);
        
        return this;
    }

    addPluginCopy (patterns) {
        const CopyPlugin = require('copy-webpack-plugin');

        const plugin = new CopyPlugin({
          patterns: patterns,
        });
        
        this._webpackConfig.plugins.push (plugin);
        
        return this;
    }

    addLoaderVue () {
        const VueLoaderPlugin = require('vue-loader/lib/plugin');
        this._webpackConfig.plugins.push (new VueLoaderPlugin());
        this._webpackConfig.module.rules.push ({
            test: /\.vue$/,
            loader: 'vue-loader',
        });
        return this;
    }

    addLoaderTypescript (esLintFiles) {
        const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

        if (!esLintFiles) {
            esLintFiles =  './src/**/*.{ts,tsx,js,vue}';
        }

        const plugin = new ForkTsCheckerWebpackPlugin({
          eslint: {
            files: esLintFiles,
          },
          typescript: {
            extensions: {
                vue: true
            }
          },
        });
        
        this._webpackConfig.plugins.push (plugin);

        this._webpackConfig.module.rules.push ({
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                        transpileOnly: true,
                    },
                },
            ],
        });
        
        return this;
    }


    // scssOptions = {
    //   additionalData: '@import "@/_scss/_global.scss";',
    // }
    addLoaderCss (cssOptions) {
        this._webpackConfig.module.rules.push ({
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          });
        
        return this;
    }

    // scssOptions = {
    //   additionalData: '@import "@/_scss/_global.scss";',
    // }
    addLoaderScss (scssOptions) {
        this._webpackConfig.module.rules.push ({
            test: /\.s[ac]ss$/i,
            use: [
                // Creates `style` nodes from JS strings
                'style-loader',
                // Translates CSS into CommonJS
                {
                loader: 'css-loader',
                    options: {
                        url: false, // Ignore url
                    },
                },
                // Compiles Sass to CSS
                {
                    loader: 'sass-loader',
                    options: scssOptions,
                },
            ],
        });
        
        return this;
    }

    addDevServer () {
        const proxy = EnvPlugin.config('WEBPACK_DEVSERVER_PROXY', 'https://stage.backend.whoop.io/');
        const host = EnvPlugin.config('WEBPACK_DEVSERVER_HOST', 'localhost');
        const port = EnvPlugin.config('WEBPACK_DEV_SERVER_PORT', 5001);

        console.log('Using proxy: ' + proxy);

        this._webpackConfig.devServer = {
            contentBase: './dist',
            port: port,
            host: host,
            hot: true,
            inline: true,
            stats: 'minimal',
            overlay: true,
            historyApiFallback: true,
            proxy: {
                '/api/': {
                    target: proxy,
                    ws: true,
                    changeOrigin: true,
                },
            },
        };
    }

    config () {
        return this._webpackConfig
    }
}

module.exports = {
    init (env, arg) {
        return new LoosePackWorker (env, arg);
    }
}