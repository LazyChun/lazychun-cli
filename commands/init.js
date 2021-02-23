// commands/init.js
const shell = require("shelljs");
const symbols = require("log-symbols");
const clone = require("../utils/clone.js");
const fs = require("fs");
const ora = require("ora"); // 用于输出loading
const chalk = require("chalk"); // 用于改变文字颜色
const notifier = require("node-notifier");
const path = require("path");
let branch = "main";

const REMOTES = {
  react: "https://github.com/LazyChun/lazychun-program-react.git",
  vue: "",
  html: "https://github.com/LazyChun/lazychun-program-html.git"
};

const initAction = async (name, option) => {
  // 0. 检查控制台是否可以运行`git `，
  if (!shell.which("git")) {
    console.log(symbols.error, "对不起，git命令不可用！");
    shell.exit(1);
  }
  // 1. 验证输入name是否合法
  if (fs.existsSync(name)) {
    console.log(symbols.warning, `已存在项目文件夹${name}！`);
    return;
  }
  if (name.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g)) {
    console.log(symbols.error, "项目名称存在非法字符！");
    return;
  }
  // 2. 获取option，确定模板类型（分支）
  //if (option.dev) branch = "develop";

  // 定义需要询问的问题
  const questions = [
    {
      type: "input",
      message: "请输入工具名称:",
      name: "name",
      validate(val) {
        if (!val) return "模板名称不能为空！";
        if (val.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g))
          return "模板名称包含非法字符，请重新输入";
        return true;
      }
    },
    {
      type: "list",
      message: "请选择工具开发环境:",
      //choices: ["react", "vue", "html"],
      choices: ["react", "html"],
      name: "type"
    },
    // {
    //   type: "input",
    //   message: "请输入模板关键词（;分割）:",
    //   name: "keywords"
    // },
    // {
    //   type: "input",
    //   message: "请输入模板简介:",
    //   name: "description"
    // },
    // {
    //     type: 'list',
    //     message: '请选择模板类型:',
    //     choices: ['响应式', '桌面端', '移动端'],
    //     name: 'type'
    // },
    // {
    //     type: 'list',
    //     message: '请选择模板分类:',
    //     choices: ['整站', '单页', '专题'],
    //     name: 'category'
    // },
    // {
    //     type: 'input',
    //     message: '请输入模板风格:',
    //     name: 'style'
    // },
    // {
    //     type: 'input',
    //     message: '请输入模板色系:',
    //     name: 'color'
    // },
    {
      type: "input",
      message: "请输入您的名字:",
      name: "author"
    }
  ];

  const inquirer = require("inquirer");
  // 通过inquirer获取到用户输入的内容
  const answers = await inquirer.prompt(questions);
  // 将用户的配置打印，确认一下是否正确
  console.log("------------------------");
  console.log(answers);

  let confirm = await inquirer.prompt([
    {
      type: "confirm",
      message: "确认创建？",
      default: "Y",
      name: "isConfirm"
    }
  ]);
  if (!confirm.isConfirm) return false;

  const programType = answers["type"];
  console.log("环境类型", programType);
  const remote = REMOTES[programType];
  console.log("remote", remote);
  console.log("branch", branch);
  // 4. 下载模板
  await clone(`direct:${remote}#${branch}`, name, {
    clone: true
  });

  // 5. 清理文件
  const deleteDir = [".git", ".gitignore", "README.md", "docs"]; // 需要清理的文件
  const pwd = shell.pwd();
  deleteDir.map(item => shell.rm("-rf", pwd + `/${name}/${item}`));

  console.log("__dirname", __dirname);
  //根据用户配置调整文件
  let jsonData = fs.readFileSync(
    (path.join(__dirname, "./"), `${name}/package.json`),
    function(err, data) {
      console.log(err);
    }
  );
  jsonData = JSON.parse(jsonData);
  for (item in answers) {
    jsonData[item] = answers[item];
  }
  console.log(jsonData);
  console.log(path.join(__dirname, `${name}/`));
  let obj = JSON.stringify(jsonData, null, "\t");
  let sss = fs.writeFileSync(
    (path.join(__dirname, "./"), `${name}/package.json`),
    obj,
    function(err, data) {
      console.log(err, data);
    }
  );
  //自动安装依赖
  const installSpinner = ora("正在安装依赖...").start();
  if (shell.exec("npm install").code !== 0) {
    console.log(symbols.warning, chalk.yellow("自动安装失败，请手动安装！"));
    installSpinner.fail(); // 安装失败
    shell.exit(1);
  }
  installSpinner.succeed(chalk.green("依赖安装成功！"));

  //切入后台的时候给用户提示
  notifier.notify({
    title: "lazychun-cli",
    icon: path.join(__dirname, "coulson.png"),
    message: " ♪(＾∀＾●)ﾉ 恭喜，项目创建成功！"
  });

  // 8. 打开编辑器
  if (shell.which("code")) shell.exec("code ./");
  shell.exit(1);
};

module.exports = initAction;
