var Generator = require('yeoman-generator');


module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
    ]);
  }
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      { title: this.answers.name }
    );
    this.fs.copyTpl(
      this.templatePath('index.vue'),
      this.destinationPath('src/index.vue'),
    );
    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js'),
    );
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
    );
    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'),
    );
    this.fs.copyTpl(
      this.templatePath('.nycrc'),
      this.destinationPath('.nycrc'),
    );
    this.fs.copyTpl(
      this.templatePath('test.js'),
      this.destinationPath('test/test-demo.js'),
    );
  }
  packageInit() {
    const pkgJson = {
      "name": this.answers.name,
      "version": "1.0.0",
      "description": "",
      "main": "generators/app/index.js",
      "scripts": {
        "build": "webpack",
        "test": "mocha --require @babel/register",
        "coverage": "nyc mocha --require @babel/register"
      },
      "author": "",
      "license": "ISC",
      "dependencies": {
        "vue": "^2.5.16"
      },
      "devDependencies": {
        "vue-loader": "^15.9.3",
        "vue-style-loader": "^4.1.2",
        "vue-template-compiler": "^2.5.16",
        "css-loader": "^4.2.2",
        "html-webpack-plugin": "^5.3.2",
        "copy-webpack-plugin": "^6.0.4",

        "webpack": "^5.42.0",
        "webpack-cli": "^4.7.2",
        "babel-loader": "^8.2.2",
        "@babel/core": "^7.14.6",
        "@babel/preset-env": "^7.14.7",
        "@babel/register": "^7.14.5",
        "@istanbuljs/nyc-config-babel": "^3.0.0",
        "babel-plugin-istanbul": "^6.0.0",
        "mocha": "^9.0.2",
        "nyc": "^15.1.0"
      },

    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
  }


};