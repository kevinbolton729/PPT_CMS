import '@babel/polyfill';
import dva from 'dva';
import 'url-polyfill';

// import createHistory from 'history/createHashHistory';
// user BrowserHistory
import createLoading from 'dva-loading';
import createHistory from 'history/createBrowserHistory';

import FastClick from 'fastclick';

// Moment
import moment from 'moment';
import 'moment/locale/zh-cn';

// 样式
import 'react-quill/dist/quill.snow.css'; // 富文本编辑器 react-quill样式
// 声明
import { App } from './global';
import './static/index.less';

// Moment 中文设置
moment.locale('zh-cn');

// 1. Initialize
const app: App = dva({
  history: createHistory(),
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

FastClick.attach(document.body);

export default app._store; // eslint-disable-line
