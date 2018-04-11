import { message as openMessage } from 'antd';
import {
  getArticleLists,
  delArticle,
  addArticle,
  editArticle,
  uploadArticleImage,
  uploadThumbImage,
} from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken, covertBase64toUrl } from '@/utils/fns';

export default {
  namespace: 'article',

  state: {
    loading: true,
    confirmLoading: false,
    originalData: [],
    data: [],
    uploading: false,
    uploadImage: '',
  },

  effects: {
    *queryArticleLists(_, { call, put, select }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const passCurrentSiteid = yield select(({ global }) => global.currentSiteid);
      // console.log(passCurrentSiteid, 'passCurrentSiteid');
      const response = yield call(getArticleLists, { siteid: passCurrentSiteid });
      const result = yield call(parseResponse, response);
      const { status, message, data } = yield result;
      // console.log(data, 'data');

      if (status > 0) {
        yield put({
          type: 'getArticleLists',
          payload: data,
        });
        yield put({
          type: 'getOriginalData',
          payload: data,
        });
      } else {
        yield call(noToken, { message, put });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 删除文章
    *delArticle({ payload }, { call, put }) {
      const response = yield call(delArticle, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryArticleLists',
        });
      } else {
        yield call(noToken, { message, put });
      }
    },
    // 添加文章
    *addArticle({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(addArticle, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryArticleLists',
        });
        yield openMessage.success(message);
      } else {
        yield call(noToken, { message, put });
      }
      yield put({
        type: 'changeConfirmLoading',
        payload: false,
      });
    },
    // 编辑文章
    *editArticle({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editArticle, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryArticleLists',
        });
        yield openMessage.success(message);
      } else {
        yield call(noToken, { message, put });
      }
      yield put({
        type: 'changeConfirmLoading',
        payload: false,
      });
    },
    // 上传react-quill编辑器内图片
    *uploadArticleImage({ payload }, { put, call }) {
      const { formData, contentOps, handleStatus, passApiData } = payload;
      // yield console.log(handleStatus, 'handleStatus');
      const response = yield call(uploadArticleImage, formData);
      const { status, message, data } = yield call(parseResponse, response);

      // yield console.log(response, 'response');
      if (status > 0) {
        // upload successfully
        // yield console.log(data, 'data');
        // yield console.log(contentOps, 'contentOps');
        const newContentOps = yield call(covertBase64toUrl, { data, contentOps });
        passApiData.content = yield newContentOps;
        // yield console.log(passApiData, 'passApiData');
        if (handleStatus) {
          // 编辑
          yield put({
            type: 'editArticle',
            payload: passApiData,
          });
        } else {
          // 添加
          yield put({
            type: 'addArticle',
            payload: passApiData,
          });
        }
      } else if (status !== -1) {
        yield openMessage.error(message);
      }
    },
    // 上传缩略图
    *uploadThumb({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadThumbImage, payload);
      // console.log(response, 'response');
      const { status, message, data } = yield call(parseResponse, response);

      if (status > 0) {
        // upload successfully
        yield put({
          type: 'changeUpLoading',
          payload: 'done',
        });
        yield put({
          type: 'changeUpLoadImage',
          payload: data[0].url,
        });
      } else if (status !== -1) {
        // 请求接口错误
        yield openMessage.error(message);
      } else {
        // axios 请求错误
        yield put({
          type: 'changeUpLoading',
          payload: 'error',
        });
      }
    },
  },

  reducers: {
    changeLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    changeConfirmLoading(state, { payload }) {
      return {
        ...state,
        confirmLoading: payload,
      };
    },
    getOriginalData(state, { payload }) {
      return {
        ...state,
        originalData: payload,
      };
    },
    getArticleLists(state, { payload }) {
      return {
        ...state,
        data: payload,
      };
    },
    changeUpLoading(state, { payload }) {
      return {
        ...state,
        uploading: payload,
      };
    },
    changeUpLoadImage(state, { payload }) {
      return {
        ...state,
        uploadImage: payload,
      };
    },
  },
};
