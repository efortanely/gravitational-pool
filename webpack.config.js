const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ENTRY_PATH = path.resolve(__dirname, "src/index");
const DIST_PATH = path.resolve(__dirname, "dist");

module.exports = {
   mode: "development",
   entry: {
      main: ENTRY_PATH,
   },
   output: {
      path: DIST_PATH,
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: "/",
   },
   module: {
    rules: [
        { 
            test: /\.css$/, 
            use: ["style-loader", "css-loader"] },
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.s[ac]ss$/,
            use: ["style-loader", "css-loader", "sass-loader"],
        },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src/index.html"),
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    static: DIST_PATH,
    hot: true,
  },
}