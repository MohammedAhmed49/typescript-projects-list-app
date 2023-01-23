const path = require("path");

module.exports = {
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "inline-source-map", // make sure source map in tsconfig is true to be able to debug
  module: {
    rules: [
      // we make sure that webpack understands ts files by using ts-loader so we test the name of files to make sure it's a ts file
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // resolve all import files that ends with ts and js
  },
};
