const webpack = require('webpack');
const path = require('path');
const env = process.env;
const packageInfo = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const banner = packageInfo.name + 'v' + packageInfo.version + ' | ' +
    '(c)' + new Date().getFullYear() + ' ' + packageInfo.author + ' | MIT license (' +
    packageInfo.license + ') | Github : ' +
    packageInfo.homepage;

const getBuildVersion = function (build) {
    let gitRevisionPlugin = new GitRevisionPlugin();
    let status = "";
    if(env.npm_lifecycle_event && env.npm_lifecycle_event =="watch"){
        status = "localbuild";
    }else{
        status = "rev."+gitRevisionPlugin.version();
    }
    return `${build.version}-${status}`;
}

const defaultConfig = {
    entry: {
        'ovenplayer': './src/js/ovenplayer.js',
        'ovenplayer.sdk' : './src/js/ovenplayer.sdk.js',
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src/js")
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    babelrc: false,
                    presets: [
                        ['env']
                    ],
                    plugins: [
                        'transform-object-assign'
                    ]
                }
            }
        ]
    }
};


const extendConfig = function (){
    console.log(env.npm_lifecycle_event );
    if(env.npm_lifecycle_event =="watch"){
        Object.assign(defaultConfig, {
            mode: 'development',
            devtool: 'inline-source-map',
            output: {
                filename: '[name].js',
                path: path.resolve(__dirname, 'dist/development/ovenplayer')
            },
            plugins: [
                new GitRevisionPlugin(),
                new webpack.DefinePlugin({
                    __VERSION__: `'${getBuildVersion(packageInfo)}'`
                }),
                new CopyWebpackPlugin(
                    [
                        {
                            from: 'src/css/',
                            to: path.resolve(__dirname, 'dist/development/ovenplayer/css')
                        },
                        {
                            from: 'src/assets/',
                            to: path.resolve(__dirname, 'dist/development/ovenplayer/assets')
                        }
                    ]
                ),
                new webpack.BannerPlugin(banner)
            ]
        });
    }else{
        Object.assign(defaultConfig, {
            mode: 'production',
            devtool: 'source-map',
            output: {
                filename: '[name].js',
                path: path.resolve(__dirname, 'dist/production/ovenplayer')
            },
            plugins: [
                new GitRevisionPlugin(),
                new webpack.DefinePlugin({
                    __VERSION__: `'${getBuildVersion(packageInfo)}'`
                }),
                new CopyWebpackPlugin(
                    [
                        {
                            from: 'src/css/',
                            to: path.resolve(__dirname, 'dist/production/ovenplayer/css')
                        },
                        {
                            from: 'src/assets/',
                            to: path.resolve(__dirname, 'dist/production/ovenplayer/assets')
                        }
                    ]
                ),
                new webpack.BannerPlugin(banner)
            ]
        });
    }

    return defaultConfig;
}

module.exports = extendConfig();