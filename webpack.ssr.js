const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const autoPrefixer = require('autoprefixer');

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index-server.js'));

  Object.keys(entryFiles).forEach((index) => {
    const entryFile = entryFiles[index];

    const match = entryFile.match(/src\/(.*)\/index-server\.js/);
    const pageName = match && match[1];

    if (pageName) {
      entry[pageName] = entryFile;
      htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
          template: path.join(__dirname, `src/${pageName}/index.html`),
          filename: `${pageName}.html`,
          chunks: ['commons', 'vendors', pageName],
          inject: true,
          minify: {
            html5: true,
            collapseWhitespace: true,
            preserveLineBreaks: false,
            minifyCSS: true,
            minifyJS: true,
            removeComments: false,
          },
        }),
      );
    }
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};

const { entry, htmlWebpackPlugins } = setMPA();

const config = {
  mode: 'none',
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-server.js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.css', '.json'],
    alias: {
      addImage: path.resolve(__dirname, 'src/components/addImage.js'),
    },
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: ['babel-loader', {
        loader: 'eslint-loader',
        options: {
          configFile: '.eslintrc.js',
        },
      }],
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            module: true,
          },
        },
        {
          loader: 'px2rem-loader',
          options: {
            remUnit: 75,
            remPrecision: 8,
          },
        },
      ],
    }, {
      test: /\.less$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [
              autoPrefixer({
                // browsers: ['last 2 version', '> 1%', 'iOS 7'],
              }),
            ],
          },
        },
        {
          loader: 'px2rem-loader',
          options: {
            remUnit: 75,
            remPrecision: 8,
          },
        },
      ],
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          // 配置url-loader的可选项
          options: {
            // 限制图片大小10000B，小于限制会将图片转换为base64格式
            limit: 10000,
            // 超出限制，创建的文件格式: dist/images/[图片名].[hash].[图片格式]
            name: 'images/[name].[hash:8].[ext]',
          },
        },
      ],
    }, {
      test: /\.(woff|woff2|ttf|eot|otf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
          },
        },
      ],
    }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
    }),
    // 压缩提取出的CSS，并解决ExtractTextPlugin分离出的CSS重复问题
    new OptimizeCSSAssetsWebpackPlugin({
      cssProcessorOptions: {
        safe: true,
      },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ].concat(htmlWebpackPlugins),
  optimization: {
    splitChunks: false, // 必须设为false，SSR才会正常工作
  },
};

module.exports = config;
