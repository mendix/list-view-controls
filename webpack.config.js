const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const widgetName = require("./package").widgetName.toLowerCase();

const packageName = process.env.npm_package_name;
const mxHost = process.env.npm_package_config_mendixHost || "http://localhost:8080";
const developmentPort = process.env.npm_package_config_developmentPort || "3000";

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
        filename: `widgets/com/mendix/widget/custom/${widgetName}/[name].js`,
        chunkFilename: `widgets/com/mendix/widget/custom/${widgetName}[id].js`,
        libraryTarget: "umd",
        publicPath: "/"
    },
    devServer: {
        port: developmentPort,
        proxy: [ {
            target: mxHost,
            context: [ "**", `!/widgets/com/mendix/widget/custom/${widgetName}/*.js` ],
            ws: true,
            onError: function(err, req, res) {
                if (res && res.writeHead) {
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    if (err.code === "ECONNREFUSED") {
                        res.end("Please make sure that the Mendix server is running at " + mxHost
                            + " or change the configuration \n "
                            + "> npm config set " + packageName + ":mendixhost http://host:port");
                    } else {
                        res.end("Error connecting to Mendix server"
                        + "\n " + JSON.stringify(err, null, 2));
                    }
                }
            }
        } ],
        stats: "errors-only"
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
    mode: "development",
    devtool: "source-map",
    externals: [ "react", "react-dom", /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new CopyWebpackPlugin(
            [ {
                from: "src/**/*.xml",
                toType: "template",
                to: "widgets/[name]/[name].[ext]",
                ignore: "src/package.xml"
            }, {
                from: "src/package.xml",
                to: "widgets/package.xml"
            } ],
            { copyUnmodified: true }
        ),
        new ExtractTextPlugin({ filename: `./widgets/com/mendix/widget/custom/${widgetName}/ui/[name].css` }),
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
        filename: "widgets/[name]/[name].webmodeler.js",
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
    mode: "development",
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

module.exports = [ widgetConfig, previewConfig ];
