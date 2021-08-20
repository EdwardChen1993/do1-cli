#!/usr/bin/env node
const program = require("commander");
const pkg = require("../package.json");
const chalk = require("chalk");

program
  .name('do1')
  .version(pkg.version)
  .usage("<command> options")
  .command("create <app-name>")
  .description("create a new project")
  .option("-f, --force", "overwrite target directory if it exits")
  // 执行上面 command 命令的这个行为时，触发回调
  .action((name, cmd) => {
    // 调用 create 模块实现
    require("../lib/create")(name, cmd);
  });

program
  .command("config [value]")
  .description("inspect and modify config")
  .option("-g, --get <path>", "get value from config")
  .option("-s, --set <path> <value>", "set value from config")
  .option("-d, --delete <path>", "delete value from config")
  .action((path, value, cmd) => {
    // 调用 config 模块实现
  });

// 监听 --help 命令
program.on("--help", () => {
  console.log(
    `\nRun ${chalk.blue(
      "do1 <command> --help"
    )} for detailed usage of given command.\n`
  );
});

// 解析用户执行命令传入的参数
program.parse(process.argv);
