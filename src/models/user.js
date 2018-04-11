import { message as openMessage } from 'antd';
import {
  query as queryUsers,
  queryCurrent,
  editPassword,
  editUser,
  uploadProtrait,
} from '@/services/user';
import { parseResponse } from '@/utils/parse';
// 常量
// import {  } from '@/utils/consts';
// 方法
import { delToken } from '@/utils/fns';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    confirmLoading: false,
    uploading: false,
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    // 获取当前登录用户信息
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      // yield console.log(response, 'response');
      const { status, message, data } = yield call(parseResponse, response);
      if (status > 0) {
        const currentUser = yield data[0];
        yield put({
          type: 'saveCurrentUser',
          payload: currentUser,
        });
      } else {
        yield openMessage.warn(message);
        yield call(delToken, { put }); // 删除localStorage中的Token
      }
    },
    // 修改登录密码
    *editPassword({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editPassword, payload);
      const { status, message } = yield call(parseResponse, response);

      if (status > 0) {
        // edit password successfully
        yield openMessage.success(message);
        yield put({
          type: 'login/logout',
        });
      } else if (status !== -1) {
        yield openMessage.error(message);
      }
      yield put({
        type: 'changeConfirmLoading',
        payload: false,
      });
    },
    // 修改用户信息
    *editUser({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      const response = yield call(editUser, payload);
      const { status, message } = yield call(parseResponse, response);

      if (status > 0) {
        // edit user successfully
        yield openMessage.success(message);
        yield put({
          type: 'fetchCurrent',
        });
      } else if (status !== -1) {
        yield openMessage.error(message);
      }
      yield put({
        type: 'changeConfirmLoading',
        payload: false,
      });
    },
    // 上传头像 protrait
    *uploadProtrait({ payload }, { call, put }) {
      yield put({
        type: 'changeUpLoading',
        payload: 'loading',
      });
      const response = yield call(uploadProtrait, payload);
      // console.log(response, 'response');
      const { status, message } = yield call(parseResponse, response);

      if (status > 0) {
        // upload successfully
        yield put({
          type: 'changeUpLoading',
          payload: 'done',
        });
        yield put({
          type: 'fetchCurrent',
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
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeConfirmLoading(state, { payload }) {
      return {
        ...state,
        confirmLoading: payload,
      };
    },
    changeUpLoading(state, { payload }) {
      return {
        ...state,
        uploading: payload,
      };
    },
    // changeNotifyCount(state, action) {
    //   return {
    //     ...state,
    //     currentUser: {
    //       ...state.currentUser,
    //       notifyCount: action.payload,
    //     },
    //   };
    // },
  },
};
