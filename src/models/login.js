import { routerRedux } from 'dva/router';
import { message as openMessage } from 'antd';
import { fakeAccountLogin, accountLoginOut } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { parseResponse } from '@/utils/parse';
// import qs from 'qs';
// 常量
import {
  MESSAGE_LOGINON_SUCCESS,
  PAGELOGIN,
  // MESSAGE_LOGINOUT_SUCCESS,
  // LOCALSTORAGENAME,
} from '@/utils/consts';
// 方法
// import {} from '@/utils/fns';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      const { status, message } = yield call(parseResponse, response);
      yield put({
        type: 'changeLoginStatus',
        payload: {
          ...response,
          currentAuthority: 'admin', // 此值应接口返回
        },
      });
      // Login successfully
      if (status > 0) {
        reloadAuthorized();
        // const { token } = yield data[0];
        yield openMessage.success(MESSAGE_LOGINON_SUCCESS);
        // yield localStorage.setItem(LOCALSTORAGENAME, qs.stringify({ token }));
        yield put(routerRedux.push('/'));
      } else {
        yield openMessage.error(message);
      }
    },
    *logout(_, { put, call, select }) {
      const response = yield call(accountLoginOut);
      const { status, message } = yield call(parseResponse, response);
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        // LoginOut successfully
        if (status > 0) {
          yield put({
            type: 'changeLoginStatus',
            payload: {
              status: false,
              currentAuthority: 'guest',
            },
          });
          reloadAuthorized();
          // yield openMessage.success(MESSAGE_LOGINOUT_SUCCESS);
          yield openMessage.success(message);
          yield put(routerRedux.push(PAGELOGIN));
        } else {
          yield openMessage.error(message);
        }
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
