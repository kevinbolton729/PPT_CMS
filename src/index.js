import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';

// import createHistory from 'history/createHashHistory';
// user BrowserHistory
import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';

import FastClick from 'fastclick';

// Moment
import moment from 'moment';
import 'moment/locale/zh-cn';

// 样式
import 'react-quill/dist/quill.snow.css'; // 富文本编辑器 react-quill样式
import './static/index.less';

// Moment 中文设置
moment.locale('zh-cn');

// 1. Initialize
const app = dva({
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
