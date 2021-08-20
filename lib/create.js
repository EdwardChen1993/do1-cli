const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const Creator = require('./Creator')

module.exports = async function (projectName, options) {
  // 获取当前命令执行时的工作目录
  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  // 判断是否存在项目名的目录
  if (fs.existsSync(targetDir)) {
    // 强制创建，删除存在的
    if (options.force) {
      await fs.remove(targetDir);
    }
    // 询问用户确认是否覆盖
    else {
      const { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          message: "Target directory already exists pink an action:",
          choices: [
            {
              name: "Overwrite",
              value: "Overwrite",
            },
            {
              name: "Merge",
              value: "Merge",
            },
            {
              name: "Cancel",
              value: false,
            },
          ],
        },
      ]);
      // 取消操作
      if (!action) {
        return;
      } 
      // 重写操作
      else if (action === "Overwrite") {
        await fs.remove(targetDir);
      }
      // 合并操作
      else if (action === "Merge") {
      }
    }
  }

  // 开始创建项目
  const creator = new Creator(projectName, targetDir)
  creator.create()
};
