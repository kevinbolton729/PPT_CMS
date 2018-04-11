// import { message as openMessage } from 'antd';
import { getSiteNums, getArticleNums, getArticleTodayNums } from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
// import { PAGELOGIN } from '@/utils/consts';
// 方法
import { noToken } from '@/utils/fns';

export default {
  namespace: 'workspace',

  state: {
    loading: true,
    lists: {},
  },

  effects: {
    *queryLists(_, { call, put, select }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const passCurrentSiteid = yield select(({ global }) => global.currentSiteid);
      // console.log(passCurrentSiteid, 'passCurrentSiteid');
      const response1 = yield call(getSiteNums, { siteid: passCurrentSiteid });
      const result1 = yield call(parseResponse, response1);
      const response2 = yield call(getArticleNums, { siteid: passCurrentSiteid });
      const result2 = yield call(parseResponse, response2);
      const response3 = yield call(getArticleTodayNums, { siteid: passCurrentSiteid });
      const result3 = yield call(parseResponse, response3);
      const status = yield result1.status * result2.status * result3.status;
      const { message } = yield result1;

      if (status > 0) {
        yield put({
          type: 'getList',
          payload: {
            siteNums: result1.count,
            articleNums: result2.count,
            articleTodayNums: result3.count,
          },
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
    getList(state, { payload }) {
      return {
        ...state,
        lists: payload,
      };
    },
  },
};
