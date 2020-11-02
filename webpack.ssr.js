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
      /*
           // 将CSS代码整合进JS文件会造成JS文件的大小变大，操作DOM也会造成性能上的问题，
           // 建议用extract-text-webpack-plugin插件将css文件打包为一个单独的文件
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    // 这里可以使用postcss先处理下css代码
                    loader: 'css-loader',
                    options: {
                        module: true
                    }
                }]
            })
            */
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
    // webpack 4中已经移除webpack.optimize.CommonsChunkPlugin插件，推荐使用config.optimization.splitChunks来代替
    /*
        new webpack.optimize.CommonsChunkPlugin({
            // manifest文件将每次打包都会更改的东西单独提取出来，保证没有更改的代码无需重新打包，可加快打包速度
            names: ['vendor', 'manifest'],
            // 配合manifest文件使用
            minChunks: Infinity
        }),
        */
    // 自动生成html文件，并自动引入js文件
    /*
        new HtmlWebpackPlugin({
            template: 'index.html',
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false
            }
        }),
        */
    // 生成全局变量，mode属性已经提供了该功能
    // new webpack.DefinePlugin({
    //     'process.env.NODE_ENV': JSON.stringify("process.env.NODE_ENV")
    // }),
    // 输出的文件路径，该插件已Deprecated，推荐使用mini-css-extract-plugin
    /*
        new ExtractTextPlugin({
            filename: 'css/[name].[hash:8].css',
            allChunks: true
        }),
        */
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
    // new webpack.HotModuleReplacementPlugin(),
    // new HtmlWebpackExternalsPlugin({
    //     externals: [
    //         {
    //             module: 'react',
    //             entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js',
    //             global: 'React'
    //         }, {
    //             module: 'react-dom',
    //             entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
    //             global: 'ReactDOM'
    //         }
    //     ]
    // })
  ].concat(htmlWebpackPlugins),
  optimization: {
    splitChunks: false, // 必须设为false，SSR才会正常工作
  },
};

module.exports = config;
