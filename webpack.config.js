var path = require("path");
var webpack = require("webpack");

module.exports = {
    // Root folder of source code
    context: path.join(__dirname, "src"),

    // Entry point(s)
    entry: {
        // JS
        javascript: ["babel-polyfill", "./index.ts"]
    },

    // Output
    output: {
        // Filename
        filename: "sp-event-callout.js",
        // Folder
        path: path.join(__dirname, "dist")
    },

    // Module
    module: {
        // Loaders
        loaders: [
            {
                // Target .ts files
                test: /\.ts$/,
                // Use the "ts-loader" library
                loader: "ts-loader",
                // Exclude the npm libraries
                exclude: /node_modules/,
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    }
          
}