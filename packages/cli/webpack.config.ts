import path from "path";
import webpack, { Configuration } from "webpack";

const config: Configuration = {
	entry: './main.ts',
	target: 'node',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.(ts|js)?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							"@babel/preset-env",
							"@babel/preset-typescript"
						],
						plugins: [
							"@babel/plugin-proposal-class-properties",
							"@babel/plugin-transform-runtime"
						]
					},
				},
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true, // if true, banner will not be wrapped in a comment
			entryOnly: true, // if true, the banner will only be added to the entry chunks
		})
	],
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "zupa.js",
	}
};
export default config;