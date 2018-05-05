import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { routerRedux, Switch } from 'dva/router';
import * as React from 'react';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';

// 样式
const styles = require('./static/index.less');

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute }: any = Authorized;

(dynamic as any).setDefaultLoadingComponent(() => {
  return <Spin className={styles.globalSpin} />;
});

function RouterConfig({ history, app }: any): React.ReactNode {
  const routerData = getRouterData(app);
  const components = {
    UserLayout: routerData['/user'].component,
    BasicLayout: routerData['/'].component,
  };
  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          <AuthorizedRoute
            path="/user"
            render={((props: any) => <components.UserLayout {...props} />) as React.ReactNode}
            redirectPath="/"
          />
          <AuthorizedRoute
            path="/"
            render={((props: any) => <components.BasicLayout {...props} />) as React.ReactNode}
            authority={['admin', 'user']}
            redirectPath="/user/login"
          />
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
