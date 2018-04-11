import React from 'react';
import { message as openMessage, Icon } from 'antd';
import { getSiteTypes, getChannelTypes } from '@/services/api';
import { parseResponse } from '@/utils/parse';
// 常量
import { SERVICE_INFO, MESSAGE_CHANGESELECTEDSITE_SUCCESS } from '@/utils/consts';
// 方法
import { gotoPage } from '@/utils/fns';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    globalConfirmLoading: false,
    notices: [],
    copyright: (
      <div>
        Copyright <Icon type="copyright" /> {SERVICE_INFO}
      </div>
    ),
    sitetypes: [],
    channeltypes: [],
    // 当前站点 默认：'59607e3c682e090ca074ecfd'
    currentSiteid: '59607e3c682e090ca074ecfd',
  },

  effects: {
    *querySiteTypes(_, { put, call }) {
      const response = yield call(getSiteTypes);
      const result = yield call(parseResponse, response);
      const { status, data } = yield result;
      // console.log(data, 'data');

      if (status > 0) {
        yield put({
          type: 'getSiteType',
          payload: data,
        });
      }
    },
    *queryChannelTypes(_, { put, call, select }) {
      const passCurrentSiteid = yield select(({ global }) => global.currentSiteid);
      // console.log(passCurrentSiteid, 'passCurrentSiteid');
      const response = yield call(getChannelTypes, { siteid: passCurrentSiteid });
      const result = yield call(parseResponse, response);
      const { status, data } = yield result;
      // console.log(data, 'data');

      if (status > 0) {
        yield put({
          type: 'getChannelType',
          payload: data,
        });
      }
    },
    // 切换站点，并更新数据
    *changeSelectedSite({ payload }, { put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      yield put({
        type: 'changeSeclectedSite',
        payload,
      });
      yield put({
        type: 'queryChannelTypes',
      });
      yield put({
        type: 'article/queryArticleLists',
      });
      yield put({
        type: 'channel/queryChanneLists',
      });
      yield put({
        type: 'workspace/queryLists',
      });
      yield put({
        type: 'changeConfirmLoading',
        payload: false,
      });
      yield openMessage.success(MESSAGE_CHANGESELECTEDSITE_SUCCESS);
    },
    // 跳转
    *goto({ payload }, { call, put }) {
      const { url, key } = payload;
      yield call(gotoPage, { url, key, put });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    changeConfirmLoading(state, { payload }) {
      return {
        ...state,
        globalConfirmLoading: payload,
      };
    },
    getSiteType(state, { payload }) {
      return {
        ...state,
        sitetypes: payload,
      };
    },
    getChannelType(state, { payload }) {
      return {
        ...state,
        channeltypes: payload,
      };
    },
    changeSeclectedSite(state, { payload }) {
      return {
        ...state,
        currentSiteid: payload,
      };
    },
  },

  subscriptions: {
    // setup({ history }) {
    //   // Subscribe history(url) change, trigger `load` action if pathname is `/`
    //   return history.listen(({ pathname, search }) => {
    //     if (typeof window.ga !== 'undefined') {
    //       window.ga('send', 'pageview', pathname + search);
    //     }
    //   });
    // },
  },
};
