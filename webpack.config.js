var path = require("path");
var webpack = require("webpack");

module.exports = {
    // Root folder of source code
    context: path.join(__dirname, "src"),

    // Entry point(s)
    entry: {
        // JS
        javascript: ["./sp-event-callout.ts"]
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
                // Target .js files
                test: /\.js$/,
                // Use the "babel-loader" library
                loader: "babel-loader",
                // Compile to ES2015 standards
                query: {
                    presets: ["es2015"]
                }
            },
            {
                // Target .ts files
                test: /\.ts$/,
                // Use the "ts-loader" library
                loader: "ts-loader",
                // Exclude the npm libraries
                exclude: /node_modules/
            }
        ]
    }
          
}