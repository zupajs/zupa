import path from 'path';
import webpack, { Compiler, Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as fs from 'fs';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const config: Configuration = {
	entry: './src/main.ts',
	target: 'node',
	mode: 'production',
	optimization: {
		minimize: true
	},
	module: {
		rules: [
			{
				test: /\.(ts|js)?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-typescript'
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-transform-runtime',
						]
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: 'disabled' // by default
		}),
		new CleanWebpackPlugin(),
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true, // if true, banner will not be wrapped in a comment
			entryOnly: true, // if true, the banner will only be added to the entry chunks
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'src/core-plugins', to: 'core-plugins' },
				{ from: 'src/plugins', to: 'plugins' },
			],
		}),
		new class ChmodPlugin {
			apply(compiler: Compiler) {
				compiler.hooks.afterEmit.tap('ChmodPlugin', (compilation) => {
					compilation.options.output.path
					fs.chmodSync(path.resolve(compilation.options.output.path!, compilation.options.output.filename as string), '755');
				})
			}
		}
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'zupa.js',
	}
};
export default config;