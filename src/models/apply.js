import {} from 'antd';
import { getApplyLists } from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken } from '@/utils/fns';

export default {
  namespace: 'apply',

  state: {
    loading: true,
    originalData: [],
    data: [],
  },

  effects: {
    // 获取栏目列表
    *queryApplyLists(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getApplyLists);
      const result = yield call(parseResponse, response);
      const { status, message, data } = yield result;
      // console.log(data, 'apply data');

      if (status > 0) {
        yield put({
          type: 'getApplyLists',
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
  },

  reducers: {
    changeLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    getOriginalData(state, { payload }) {
      return {
        ...state,
        originalData: payload,
      };
    },
    getApplyLists(state, { payload }) {
      return {
        ...state,
        data: payload,
      };
    },
  },
};
