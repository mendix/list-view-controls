const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const widgetName = require("./package").widgetName.toLowerCase();

const widgetConfig = {
    entry: {
        CheckBoxFilter: "./src/CheckBoxFilter/components/CheckBoxFilterContainer.ts",
        DropDownFilter: "./src/DropDownFilter/components/DropDownFilterContainer.ts",
        DropDownSort: "./src/DropDownSort/components/DropDownSortContainer.ts",
        TextBoxSearch: "./src/TextBoxSearch/components/TextBoxSearchContainer.ts",
        Pagination: "./src/Pagination/components/PaginationContainer.ts",
        HeaderSort: "./src/HeaderSort/components/HeaderSortContainer.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/com/mendix/widget/custom/${widgetName}/[name].js`,
        chunkFilename: `src/com/mendix/widget/custom/${widgetName}[id].js`,
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.s?css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!sass-loader"
                })
            },
            {
                test: /\.gif$/,
                use: [ {
                    loader: "url-loader",
                    options: { limit: 8192 }
                } ]
            }
        ]
    },
    devtool: "source-map",
    externals: [ "react", "react-dom", /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({ filename: `./src/com/mendix/widget/custom/${widgetName}/ui/[name].css` }),
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

const previewConfig = {
    entry: {
        CheckBoxFilter: "./src/CheckBoxFilter/CheckBoxFilter.webmodeler.ts",
        DropDownFilter: "./src/DropDownFilter/DropDownFilter.webmodeler.ts",
        DropDownSort: "./src/DropDownSort/DropDownSort.webmodeler.ts",
        TextBoxSearch: "./src/TextBoxSearch/TextBoxSearch.webmodeler.ts",
        Pagination: "./src/Pagination/Pagination.webmodeler.ts",
        HeaderSort: "./src/HeaderSort/HeaderSort.webmodeler.ts"

    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/[name]/[name].webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.s?css$/, use: [
                { loader: "raw-loader" },
                { loader: "sass-loader" }
            ] }
        ]
    },
    devtool: "inline-source-map",
    externals: [ "react", "react-dom", /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

module.exports = [ widgetConfig, previewConfig ];
