import request from '@/utils/axios';
// 方法
import { setMd5 } from '@/utils/fns';
// 常量
import { API_DOMAIN } from '@/utils/consts';

// [POST]
// 登录
export async function fakeAccountLogin(params) {
  const { username } = params;
  const password = setMd5(params.password);
  // await console.log(username, 'username');
  // await console.log(password, 'password');
  return request(`${API_DOMAIN}/api/server/loginon`, {
    method: 'POST',
    body: { username, password },
  });
}
// 注册
export async function fakeRegister(params = {}) {
  return request(`${API_DOMAIN}/api/server/register`, {
    method: 'POST',
    body: params,
  });
}
// 删除栏目
export async function delChannel(params) {
  return request(`${API_DOMAIN}/api/server/delchannel`, {
    method: 'POST',
    body: { channelid: params },
  });
}
// 添加栏目
export async function addChannel(params = {}) {
  return request(`${API_DOMAIN}/api/server/addchannel`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑栏目
export async function editChannel(params = {}) {
  return request(`${API_DOMAIN}/api/server/editchannel`, {
    method: 'POST',
    body: { ...params },
  });
}
// 删除文章
export async function delArticle(params) {
  return request(`${API_DOMAIN}/api/server/delarticle`, {
    method: 'POST',
    body: { articleid: params },
  });
}
// 添加文章
export async function addArticle(params = {}) {
  return request(`${API_DOMAIN}/api/server/addarticle`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑文章
export async function editArticle(params = {}) {
  return request(`${API_DOMAIN}/api/server/editarticle`, {
    method: 'POST',
    body: { ...params },
  });
}
// 删除店铺
export async function delShop(params) {
  return request(`${API_DOMAIN}/api/server/delshop`, {
    method: 'POST',
    body: { shopid: params },
  });
}
// 添加店铺
export async function addShop(params = {}) {
  return request(`${API_DOMAIN}/api/server/addshop`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑店铺
export async function editShop(params = {}) {
  return request(`${API_DOMAIN}/api/server/editshop`, {
    method: 'POST',
    body: { ...params },
  });
}
// 删除品牌
export async function delBrand(params) {
  return request(`${API_DOMAIN}/api/server/delbrand`, {
    method: 'POST',
    body: { brandid: params },
  });
}
// 添加品牌
export async function addBrand(params = {}) {
  return request(`${API_DOMAIN}/api/server/addbrand`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑品牌
export async function editBrand(params = {}) {
  return request(`${API_DOMAIN}/api/server/editbrand`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑轮播图片
export async function editSilde(params = {}) {
  return request(`${API_DOMAIN}/api/server/editsilde`, {
    method: 'POST',
    body: { ...params },
  });
}
// 编辑广告图片
export async function editAdver(params = {}) {
  return request(`${API_DOMAIN}/api/server/editadver`, {
    method: 'POST',
    body: { ...params },
  });
}
// [图片]
// 上传react-quill编辑器内图片
export async function uploadArticleImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/articleimages`, {
    method: 'POST',
    body: params,
  });
}
// 上传图片 产品缩略图
export async function uploadThumbImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/producthumb`, {
    method: 'POST',
    body: params,
  });
}
// 上传图片 Channel
export async function uploadChannelImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/channelimages`, {
    method: 'POST',
    body: params,
  });
}
// 上传店铺图片 Shop
export async function uploadShopImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/shopimages`, {
    method: 'POST',
    body: params,
  });
}
// 上传品牌图片 Brand
export async function uploadBrandImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/brandimages`, {
    method: 'POST',
    body: params,
  });
}
// 上传轮播图片 Silde
export async function uploadSildeImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/sildeimages`, {
    method: 'POST',
    body: params,
  });
}
// 上传广告图片 Adver
export async function uploadAdverImage(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/adverimages`, {
    method: 'POST',
    body: params,
  });
}
// [视频]
// 上传广告视频 Video
export async function uploadVideo(params = {}) {
  return request(`${API_DOMAIN}/api/server/upload/homevideos`, {
    method: 'POST',
    body: params,
  });
}

// [GET]
// 获取所有站点数
export async function getSiteNums(params = {}) {
  return request(`${API_DOMAIN}/api/server/sitequantity`, {
    params,
  });
}
// 获取所有文章数
export async function getArticleNums(params = {}) {
  return request(`${API_DOMAIN}/api/server/articlequantity`, {
    params,
  });
}
// 获取今日发布文章数
export async function getArticleTodayNums(params = {}) {
  return request(`${API_DOMAIN}/api/server/todayarticlequantity`, {
    params,
  });
}
// 获取当前站点全部栏目列表
export async function getChanneLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/channels`, {
    params,
  });
}
// 获取当前站点全部文章列表
export async function getArticleLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/articles`, {
    params,
  });
}
// 获取全部实体店铺列表
export async function getShopLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/shops`, {
    params,
  });
}
// 获取全部品牌故事列表
export async function getBrandLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/brands`, {
    params,
  });
}
// 获取站点隐射表
export async function getSiteTypes(params = {}) {
  return request(`${API_DOMAIN}/api/server/sitetype`, {
    params,
  });
}
// 获取栏目隐射表
export async function getChannelTypes(params = {}) {
  return request(`${API_DOMAIN}/api/server/channeltype`, {
    params,
  });
}
// 获取加盟申请列表
export async function getApplyLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/applys`, {
    params,
  });
}
// 获取轮播图
export async function getSildeLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/sildes`, {
    params,
  });
}
// 获取首页广告图
export async function getAdverLists(params = {}) {
  return request(`${API_DOMAIN}/api/server/advers`, {
    params,
  });
}

// 下载
export async function downloadFile(params = {}) {
  return request(`${API_DOMAIN}/api/server/getfile/${params.id}`, {
    responseType: 'blob',
  });
}
