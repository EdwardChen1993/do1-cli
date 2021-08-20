const childProcess = require("child_process");
const inquirer = require("inquirer");
const { promisify } = require("util");
const path = require("path");
const downloadGitRepo = require("download-git-repo");
const figlet = promisify(require('figlet'))
const chalk = require("chalk");
const ora = require("ora");
const { fetchRepoList, fetchTagList } = require("./request");
const pkg = require('../package.json')

class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName;
    this.target = targetDir;
    this.downloadGitRepo = promisify(downloadGitRepo);
  }

  async fetchRepo() {
    let repos = await fetchRepoList();
    if (!repos) return;
    repos = repos
      .filter((item) => ["vue", "react"].includes(item.name)) // 为了演示过滤掉和模板无关的仓库
      .map((item) => item.name);
    let { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "please choose a framework to create your project",
    });
    return repo;
  }

  async fetchTag(repo) {
    let tags = await fetchTagList(repo);
    if (!tags) return;
    tags = tags.map((item) => item.name);
    let { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tags,
      message: "please choose a version to create your project",
    });
    return tag;
  }

  async fetchIsUseTS() {
    const { useTS } = await inquirer.prompt({
      name: "useTS",
      type: "confirm",
      message: "please confirm whether to use typescript",
      default: false,
    });
    return useTS;
  }

  async download(repo, tag, isUseTS) {
    // 1.拼接下载路径
    // 可以直接使用简写路径
    // GitHub - github:owner/name or simply owner/name
    let requestUrl;
    // 使用 typescript ，下载路径使用分支名，否则使用标签名
    if (isUseTS) {
      const branch = `${repo}${tag.split(".")[0]}-template-with-typescript`;
      requestUrl = `EdwardChen11993/${repo}#${branch}`;
    } else {
      requestUrl = `EdwardChen1993/${repo}#${tag}`;
    }
    // 2.将资源下载到某个目录下
    const loading = ora("fetching");
    loading.start();
    try {
      await this.downloadGitRepo(
        requestUrl,
        path.resolve(process.cwd(), this.target)
      );
      loading.succeed("download completed");
    } catch (error) {
      loading.fail("download fail, please try again");
      return Promise.reject(error);
    }
    return this.target;
  }

  async create() {
    // 采用远程拉取的方式 -> github
    // 1.拉取当前账号下的模板
    const repo = await this.fetchRepo();

    // 2.通过模板查找版本号
    const tag = await this.fetchTag(repo);

    // 3.询问是否使用 typescript
    const isUseTS = await this.fetchIsUseTS();

    // 4.下载
    await this.download(repo, tag, isUseTS);

    // 提示炫酷大文字
    const figletText = await figlet(`${pkg.name} Welcome`)
    console.log(figletText)

    const loading = ora("installing dependences\n");
    loading.start();
    try {
      // 5.自动安装依赖
      childProcess.execSync("npm install", { cwd: `./${this.name}` }); // 使用子进程执行命令，cwd 设置子进程的当前工作目录
      loading.succeed('install dependences completed')

      // 6.提示用户接下来的操作
      console.log(
        `🎉  Successfully created project ${chalk.yellow(this.name)}`
      );
      console.log("👉  Get started with the following commands:");
      console.log(chalk.blue(`$ cd ${this.name}`));
      console.log(chalk.blue("$ npm run serve"));
    } catch (error) {
      loading.fail('install dependences fail, please try again')
    }
  }
}

module.exports = Creator;
