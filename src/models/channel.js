import { message as openMessage } from 'antd';
import {
  getChanneLists,
  delChannel,
  addChannel,
  editChannel,
  uploadChannelImage,
} from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken } from '@/utils/fns';

export default {
  namespace: 'channel',

  state: {
    loading: true,
    confirmLoading: false,
    originalData: [],
    data: [],
    uploading: false,
    uploadImage: '',
  },

  effects: {
    // 获取栏目列表
    *queryChanneLists(_, { call, put, select }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const passCurrentSiteid = yield select(({ global }) => global.currentSiteid);
      // console.log(passCurrentSiteid, 'passCurrentSiteid');
      const response = yield call(getChanneLists, { siteid: passCurrentSiteid });
      const result = yield call(parseResponse, response);
      const { status, message, data } = yield result;
      // console.log(data, 'channel data');

      if (status > 0) {
        yield put({
          type: 'getChanneLists',
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
    // 删除栏目
    *delChannel({ payload }, { call, put }) {
      const response = yield call(delChannel, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryChanneLists',
        });
        yield put({
          type: 'global/queryChannelTypes',
        });
      } else {
        yield call(noToken, { message, put });
      }
    },
    // 添加栏目
    *addChannel({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(addChannel, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryChanneLists',
        });
        yield put({
          type: 'global/queryChannelTypes',
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
    // 编辑栏目
    *editChannel({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editChannel, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryChanneLists',
        });
        yield put({
          type: 'global/queryChannelTypes',
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
    // 上传栏目图片
    *uploadChannel({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadChannelImage, payload);
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
    getChanneLists(state, { payload }) {
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
