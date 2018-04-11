/*
 * @Author: Kevin Bolton
 * @Date: 2018-02-05 22:04:50
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-04-10 13:42:52
 */
import React from 'react';
import { routerRedux } from 'dva/router';
import { message as openMessage, Tag } from 'antd';
import md5 from 'js-md5';
// 常量
import {
  URL_PREFIX,
  API_DOMAIN,
  SECRETKEY_USER,
  DATA_NODATA,
  // LOCALSTORAGENAME,
  PAGELOGIN,
} from '@/utils/consts';

// md5处理
export const setMd5 = (pwd) => {
  return md5(md5(pwd + SECRETKEY_USER) + SECRETKEY_USER);
};

// 格式化数字
const twoDecimal = (num) => {
  // 显示数字，保留小数点后两位
  // 返回值的类型为String
  const f = parseFloat(num);

  if (!f) {
    return '0.00';
  }

  return (Math.floor(f * 100) / 100).toFixed(2);
};
export const parseNum = value => twoDecimal(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// 解析URL地址
export const parseUrl = (url) => {
  let newUrl = url;
  const httpIndexOf = newUrl && newUrl.indexOf('http');
  if (httpIndexOf === -1) {
    newUrl = `${API_DOMAIN}${newUrl}`;
  }
  return newUrl;
};
// 获取sort
export const getSortType = (sort, maps = []) => {
  let sortTypeNum = 0;
  const codes = maps;
  for (let i = 0; i < codes.length; i += 1) {
    if (sort === codes[i].sortId) {
      const { sortType } = codes[i];
      sortTypeNum = sortType;
      break;
    }
  }
  return parseInt(sortTypeNum, 10);
};
// 获取typeName
export const getTypeName = (sort, maps = []) => {
  let result = DATA_NODATA;
  let parentName = '';
  const codes = maps;
  for (let i = 0; i < codes.length; i += 1) {
    if (sort === codes[i].sortId) {
      if (parseInt(codes[i].sortPid, 10) !== 0) {
        // 获取父类别,递归方法getypeName
        parentName = getTypeName(codes[i].sortPid, codes);
        parentName += ' / ';
      }
      result = parentName + codes[i].sortName;
      break;
    }
  }
  return result;
};
// 解析隐射表 站点/栏目 返回JSX元素
export const getMapTypeName = (ids, maps = []) => {
  const result = [];
  const codes = maps;

  for (let i = 0; i < ids.length; i += 1) {
    for (let n = 0; n < codes.length; n += 1) {
      if (ids[i] === codes[n].siteid || ids[i] === codes[n].channelid) {
        result.push(<Tag key={`mapid_${i}`}>{codes[n].name}</Tag>);
        break;
      }
    }
  }
  return result;
};
// 解析隐射表 站点/栏目 返回字符串
export const getMapStrName = (ids, maps = []) => {
  const result = [];
  const codes = maps;

  for (let i = 0; i < ids.length; i += 1) {
    for (let n = 0; n < codes.length; n += 1) {
      if (ids[i] === codes[n].siteid || ids[i] === codes[n].channelid) {
        result.push(codes[n].name);
        break;
      }
    }
  }
  return result;
};
/**
 * 无限级数菜单
 * --- START ---
 * @description 生成无限级数菜单
 * @param {Array} firstMenus 一级菜单
 * @param {Array} [data=[]]  菜单数据
 */
export const getMenus = (firstMenus, data = []) =>
  firstMenus.reduce((arr, current) => {
    const children = [];
    const obj = { ...current };
    children.push(...getChildMenus(current.sortId, data));
    if (children.length > 0) {
      obj.children = children;
    }
    arr.push(obj);
    return arr;
  }, []);
/**
 * @description 生成一级菜单
 * @param {Array} [data=[]]  菜单数据
 */
export const getFirstMenu = (data = []) =>
  data.reduce((arr, current) => {
    if (parseInt(current.sortPid, 10) === 0) {
      return arr.concat(current);
    }
    return arr;
  }, []);
/**
 * @description 生成下级菜单
 * @param {Array} [data=[]]  菜单数据
 */
export const getChildMenus = (sortId, data = []) =>
  data.reduce((arr, current) => {
    const children = [];
    if (sortId === current.sortPid) {
      const obj = { ...current };
      children.push(...getChildMenus(current.sortId, data));
      if (children.length > 0) {
        obj.children = children;
      }
      arr.push(obj);
    }
    return arr;
  }, []);
// 字符串转换成大写
export const strToUpper = str => str.toString().toUpperCase();
// 获取图片Base64编码内容
export const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};
// base64 to Blob
export const base64UrlToBlob = (urlData) => {
  // 去掉url的头，并转换为byte
  const bytes = window.atob(urlData.split(',')[1]);
  // 处理异常,将ascii码小于0的转换为大于0
  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);
  ia.forEach((i, index) => {
    ia[index] = bytes.charCodeAt(index);
  });
  return new Blob([ia], {
    type: urlData
      .split(',')[0]
      .split(':')[1]
      .split(';')[0],
  });
};
// 过滤react-quill getContent()的内容，获取待上传的图片
export const getUploadImgs = (passArr = []) => {
  if (passArr.length === 0) return passArr;

  const newArr = passArr;

  const uploadImages = newArr.reduce((arr, current) => {
    if (current.insert.image) {
      const { image } = current.insert;
      // console.log(image, 'image');
      // 过滤掉网络图片的url
      if (image.indexOf('data:image') !== -1) {
        return arr.concat(base64UrlToBlob(image));
      }
    }
    return arr;
  }, []);

  // console.log(uploadImages, 'uploadImages');
  return uploadImages;
};
// 使用图片url 替换 Delta中base64 image
export const covertBase64toUrl = (params) => {
  const { data, contentOps } = params;
  // console.log(data, 'data');
  // console.log(contentOps, 'contentOps');

  let n = 0;
  for (let i = 0; i < contentOps.length; i += 1) {
    const { image } = contentOps[i].insert;
    if (image && image.indexOf('data:image') !== -1) {
      // console.log(image, 'image');
      contentOps[i].insert.image = URL_PREFIX + data[n].url;
      n += 1;
    }
  }

  // console.log(contentOps, 'new contentOps');
  return contentOps;
};
// 图片上传前
export const beforeUpload = (file) => {
  const isIMG =
    file.type.indexOf('image/jpeg') !== -1 ||
    file.type.indexOf('image/gif') !== -1 ||
    file.type.indexOf('image/png') !== -1;
  const isLt = file.size / 1024 / 1024 < 1000;

  if (!isIMG) {
    openMessage.error('请上传格式为：JPG/GIF/PNG的图片!');
  }
  if (!isLt) {
    openMessage.error('请上传小于1000M的图片!');
  }

  return isIMG && isLt;
};
// 视频上传前
export const beforeUploadVideo = (file) => {
  const isMp4 = file.type.indexOf('video/mp4') !== -1;
  const isLt = file.size / 1024 / 1024 < 50;

  if (!isMp4) {
    openMessage.error('请上传格式为：MP4的视频!');
  }
  if (!isLt) {
    openMessage.error('请上传小于50M的视频!');
  }

  return isMp4 && isLt;
};
// --- END ---

// [models]
// 删除Token,并跳转至登录页 /user/login
export function* delToken(params) {
  const { put } = yield params;

  // yield localStorage.removeItem(LOCALSTORAGENAME);
  yield put(routerRedux.push(PAGELOGIN));
}
// Token失效时，提示并跳转至 /user/login
export function* noToken(params) {
  const { message, put } = yield params;

  // yield openMessage.warn(message);
  yield console.warn(message, 'no token message');
  yield put(routerRedux.push(PAGELOGIN));
}
// 跳转页面
export function* gotoPage(params) {
  const { url, key, put } = yield params;

  // yield console.log(key, 'key');
  yield put(routerRedux.push({ pathname: url, query: { key } }));
}
