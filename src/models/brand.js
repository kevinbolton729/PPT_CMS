import { message as openMessage } from 'antd';
import { getBrandLists, delBrand, addBrand, editBrand, uploadBrandImage } from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken } from '@/utils/fns';

export default {
  namespace: 'brand',

  state: {
    loading: true,
    confirmLoading: false,
    originalData: [],
    data: [],
    uploading: false,
    uploadImage: '',
  },

  effects: {
    *queryBrandLists(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getBrandLists);
      const result = yield call(parseResponse, response);
      const { status, message, data } = yield result;
      // console.log(data, 'data');

      if (status > 0) {
        yield put({
          type: 'getBrandLists',
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
    // 删除品牌
    *delBrand({ payload }, { call, put }) {
      const response = yield call(delBrand, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryBrandLists',
        });
      } else {
        yield call(noToken, { message, put });
      }
    },
    // 添加品牌
    *addBrand({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(addBrand, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryBrandLists',
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
    // 编辑品牌
    *editBrand({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editBrand, payload);
      const result = yield call(parseResponse, response);
      const { status, message } = yield result;

      if (status > 0) {
        yield put({
          type: 'queryBrandLists',
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
    // 上传品牌图片
    *uploadBrand({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadBrandImage, payload);
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
    getBrandLists(state, { payload }) {
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
