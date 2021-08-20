const axios = require("axios");
const ora = require("ora");
const loading = ora("fetching");

// 请求拦截器
axios.interceptors.request.use((config) => {
  loading.start();
  return config;
});
// 响应拦截器
axios.interceptors.response.use(
  (res) => {
    loading.succeed('fetch completed');
    return res.data;
  },
  (error) => {
    loading.fail("fetch fail, please try again")
    return Promise.reject(error)
  }
);

// 获取用户 github 上的仓库列表
async function fetchRepoList() {
  return axios.get("https://api.github.com/users/EdwardChen1993/repos");
}

// 获取用户某个仓库列表下的标签列表
async function fetchTagList(repo) {
  return axios.get(`https://api.github.com/repos/EdwardChen1993/${repo}/tags`);
}

module.exports = { fetchRepoList,fetchTagList };