const path = require('path');
const webpack = require('webpack');
const EnvPlugin = require('./libs/env.js');

class LoosePackWorker {
    _webpackConfig = {};

    constructor (env, arg) {
        console.log(env);
        console.log(arg);

        this._env = EnvPlugin;
        this._env.setArgsFromWebpackEnv(env);
        this._env.loadConfig(env);

        this._webpackConfig = {
            mode: 'development',
            devtool: 'hidden-source-map',

            entry: {
                app: './src/app.ts',
            },
            output: {
                filename: '[name].[fullhash].js',
                path: './dist',
                publicPath: '/',
            },
            plugins: [
                new webpack.DefinePlugin(EnvPlugin.vueEnv()),
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

    addDevServer ({ port, proxyPath, proxyTarget, host }) {
        proxyPath = proxyPath || '/api/';
        host = host || 'localhost';
        port = port || 3000;

        console.log('Using proxy: ' + proxyTarget);

        this._webpackConfig.devServer = {
            contentBase: './dist',
            port: port,
            host: host,
            hot: true,
            inline: true,
            stats: 'minimal',
            overlay: true,
            historyApiFallback: true,
            proxy: { },
        };

        this._webpackConfig.devServer.proxy[proxyPath] = {
            target: proxyTarget,
            ws: true,
            changeOrigin: true,
        }
    }

    env (val, defaultVall) {
        return this._env.env(val, defaultVall);
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