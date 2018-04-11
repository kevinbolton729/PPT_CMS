import { message as openMessage } from 'antd';
import { getAdverLists, uploadAdverImage, uploadVideo, editAdver } from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken } from '@/utils/fns';

export default {
  namespace: 'adver',

  state: {
    loading: true,
    confirmLoading: false,
    originalData: [],
    data: [],
    uploading: false,
  },

  effects: {
    // 获取广告图片列表
    *queryAdverLists(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getAdverLists);
      const result = yield call(parseResponse, response);
      const { status, message, data } = yield result;
      // console.log(data, 'adver data');

      if (status > 0) {
        yield put({
          type: 'getAdverLists',
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
    // 编辑广告图片
    *editAdver({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editAdver, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryAdverLists',
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
    // 上传广告图片
    *uploadAdver({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadAdverImage, payload);
      // console.log(response, 'response');
      const { status, message } = yield call(parseResponse, response);

      if (status > 0) {
        // upload successfully
        yield put({
          type: 'changeUpLoading',
          payload: 'done',
        });
        yield put({
          type: 'queryAdverLists',
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
    // 上传广告视频
    *uploadVideo({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadVideo, payload);
      // console.log(response, 'response');
      const { status, message } = yield call(parseResponse, response);

      if (status > 0) {
        // upload successfully
        yield put({
          type: 'changeUpLoading',
          payload: 'done',
        });
        yield put({
          type: 'queryAdverLists',
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
    getAdverLists(state, { payload }) {
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
  },
};
