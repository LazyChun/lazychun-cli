#!/usr/bin/env node

const commander = require('commander');
const initAction = require('./commands/init')
//查询版本号
commander.version(require('./package.json').version,'-v,-V,--version', '查看版本号')
commander.command('init <name>') // 定义init子命令，<name>为必需参数可在action的function中接收，如需设置非必需参数，可使用中括号
    .option('-d, --dev', '获取开发版') // 配置参数，简写和全写中使用,分割
    .description('创建项目') // 命令描述说明
    .action(initAction);


//这句话必须写在最后面   提供帮助  -h
commander.parse(process.argv);