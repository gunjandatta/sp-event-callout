var path = require("path");

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
        // Folder
        path: path.join(__dirname, "dist"),
        // Filename
        filename: "sp-event-callout.js"
    },

    // Module
    module: {
        // Rules
        rules: [
            // TypeScript Compiler
            {
                // Target .ts(x) files
                test: /\.tsx?$/,
                // Exclude the node_modules folder
                exclude: /node_modules/,
                // Loaders - Runs bottom up
                use: [
                    // JS (ES5) -> JS (Current)
                    {
                        loader: "babel-loader",
                        options: { presets: ["@babel/preset-env"] }
                    },
                    // TypeScript -> JS (ES5)
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    }

}