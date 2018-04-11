import React from 'react';
import { connect } from 'dva';
import { Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import GlobalFooter from '@/components/GlobalFooter';
// import logo from '@/assets/logo.svg';
import { getRoutes } from '@/utils/utils';
// 常量
import { SYS_INFO, BROWSER_INFO, LOGO_USER, DOCUMENTITLE, PAGELOGIN } from '@/utils/consts';
// 样式
import styles from './UserLayout.less';

const logo = LOGO_USER;

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = `${DOCUMENTITLE} | 登录`;
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - ${DOCUMENTITLE} | 登录`;
    }
    return title;
  }
  render() {
    const { routerData, match, copyright } = this.props;
    const infoClass = classNames(styles.top, styles.info_browser);
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <img alt="logo" className={styles.logo} src={logo} />
              </div>
              <div className={styles.desc}>
                <span className={styles.info_span}>{SYS_INFO}</span>
              </div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to={PAGELOGIN} />
            </Switch>
            <div className={infoClass}>{BROWSER_INFO}</div>
            <GlobalFooter copyright={copyright} />
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ global }) => ({
  copyright: global.copyright,
}))(UserLayout);
