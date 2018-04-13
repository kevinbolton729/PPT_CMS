import axios from 'axios';
import { notification } from 'antd';
import qs from 'qs';
// 常量
// import { LOCALSTORAGENAME } from '@/utils/consts';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
  555: '网络请求错误',
};

function checkStatus(response, resolve) {
  if (response.status >= 200 && response.status < 300) {
    return resolve(response);
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.status = response.status;
  throw error;
}

function fetch(url, options) {
  let withCredentials = true;
  if (options && options.credentials) {
    withCredentials = options.credentials;
  }

  // console.log(options.params, 'axios params');
  return new Promise((resolve, reject) => {
    axios({
      url,
      timeout: 30000, // 设置超时时长
      params: options.params || {},
      data: options.body || {},
      method: options.method || 'GET',
      headers: options.headers || {},
      withCredentials,
      responseType: options.responseType || 'json',
    })
      .then((response) => {
        checkStatus(response, resolve);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// 添加token至请求的header的白名单
// function noAddtoken(url) {
//   // 白名单（白名单内的请求地址不添加）
//   const ignores = ['loginon', 'register'];
//   const result = ignores.reduce((arr, current) => {
//     if (url.indexOf(current) !== -1) {
//       arr.push(current);
//     }
//     return arr;
//   }, []);

//   return result.length !== 0;
// }

// request/response拦截器
// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const newOptions = { ...options };

  newOptions.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...newOptions.headers,
  };
  // 根据请求的url，判断是否需要在headers中添加token
  // if (!noAddtoken(url)) {
  //   const { token } = qs.parse(localStorage.getItem(LOCALSTORAGENAME));
  //   newOptions.headers.Authorization = `Bearer ${token}`;
  //   console.log(newOptions.headers.Authorization, 'Authorization');
  // }
  // POST PUT 请求时，序列化传递参数body
  if (
    (newOptions.method === 'POST' || newOptions.method === 'PUT') &&
    url.indexOf('/upload/') === -1
  ) {
    newOptions.body = qs.stringify(newOptions.body);
  } else {
    newOptions.headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  return fetch(url, newOptions)
    .then(response => response.data)
    .catch((error) => {
      const newError = error;
      const errorMessage = newError.message;
      newError.message = codeMessage[newError.status] || codeMessage['555'];
      if (errorMessage.indexOf('timeout') !== -1) {
        newError.message = codeMessage['504'];
      }

      notification.error({
        message: '对不起! 请求错误啦',
        description: newError.message,
      });

      // console.log(`请求URL: ${url}`);
      return {
        status: -1,
        message: newError.message,
        extData: [],
      };
    });
}
