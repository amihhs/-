const webpack = require('webpack');
const VueLoaderPluging = require('vue-loader/lib/plugin');
const CopyPluging = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
            { test: /\.vue$/, use: 'vue-loader' },
            { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
            {
                test: /\.js$/, use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                ]
            },

        ],
    },
    plugins: [
        new VueLoaderPluging(),
        new CopyPluging({
            patterns: [{
                from: 'src/*.html', to: '[name].[ext]'
            }]
        })
    ],
};