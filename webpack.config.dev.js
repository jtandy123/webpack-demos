const path = require('path');
// const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

const isPublish = process.env.NODE_ENV === 'production';

const config = {
  mode: 'development',
  entry: {
    // bundle: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
    bundle: ['./src/index.js'],
    vendor: ['lodash'],
  },
  output: {
    publicPath: '', // 知道如何寻找资源
    path: path.resolve(__dirname, 'dist'), // 必须使用绝对路径，输出文件夹
    // 希望缓存生效，就应该每次在更改代码以后修改文件名
    // [chunkhash]会自动根据文件是否更改而更换哈希, [hash]起不到缓存依赖库的作用
    filename: '[name].[chunkhash:8].js', // 打包后输出文件的文件名
  },
  // 修改webpack-dev-server配置
  devServer: {
    contentBase: './dist',
    // hot: true,
    port: 8081,
  },
  resolve: {
    extensions: ['.js', '.css', '.json'],
    alias: {
      addImage: path.resolve(__dirname, 'src/components/addImage.js'),
    },
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
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
      ],
      /*
            // 将CSS代码整合进JS文件会造成JS文件的大小变大，操作DOM也会造成性能上的问题，建议用extract-text-webpack-plugin插件将css文件打包为一个单独的文件
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
              require('autoprefixer')({
                browsers: ['last 2 version', '> 1%', 'iOS 7'],
              }),
            ],
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
      use: 'file-loader',
    }],
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      verbose: true, // 打印日志
      dry: false, // 删除文件
    }),
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
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    // 生成全局变量, mode属性已经提供了该功能
    // new webpack.DefinePlugin({
    //     'process.env.NODE_ENV': JSON.stringify("process.env.NODE_ENV")
    // }),
    // 输出的文件路径，该插件已Deprecated，推荐使用mini-css-extract-plugin
    /*
        new ExtractTextPlugin({
            filename: 'css/[name].[hash].css',
            allChunks: true
        }),
        */
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].[ext]',
    }),
    // 压缩提取出的CSS，并解决ExtractTextPlugin分离出的CSS重复问题
    new OptimizeCSSAssetsWebpackPlugin({
      cssProcessorOptions: {
        safe: true,
      },
    }),
    // new webpack.HotModuleReplacementPlugin()
  ],
};

if (isPublish) {
  // webpack 4中已经移除webpack.optimize.UglifyJsPlugin，推荐使用config.optimization.minimize来代替
  /*
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        mangle:{
            except:['$super','$','exports','require']
        }
    }));
    */
}

module.exports = config;
