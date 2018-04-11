import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
    mode: {
      isRegister: false, // 是否使用注册
      isMobile: false, // 是否使用手机号码登录
      isOther: false, // 是否使用其他登录方式
      isForget: false, // 是否使用忘记密码
      isAuto: false, // 是否使用自动登录
    },
  };

  onTabChange = (type) => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = (content) => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type, mode } = this.state;
    const { isRegister, isMobile, isOther, isForget, isAuto } = mode;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="账户密码登录">
            {login.status === 'error' &&
              login.type === 'account' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="username" placeholder="账号" />
            <Password name="password" placeholder="密码" />
          </Tab>
          {isMobile && (
            <Tab key="mobile" tab="手机号登录">
              {login.status === 'error' &&
                login.type === 'mobile' &&
                !login.submitting &&
                this.renderMessage('验证码错误')}
              <Mobile name="mobile" />
              <Captcha name="captcha" />
            </Tab>
          )}
          <div>
            {isAuto && (
              <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>
                自动登录
              </Checkbox>
            )}
            {isForget && (
              <a style={{ float: 'right' }} href="">
                忘记密码
              </a>
            )}
          </div>
          <Submit loading={submitting}>登录</Submit>
          <div className={styles.other}>
            {isOther && (
              <span>
                其他登录方式
                <Icon className={styles.icon} type="alipay-circle" />
                <Icon className={styles.icon} type="taobao-circle" />
                <Icon className={styles.icon} type="weibo-circle" />
              </span>
            )}
            {isRegister && (
              <Link className={styles.register} to="/user/register">
                注册账户
              </Link>
            )}
          </div>
        </Login>
      </div>
    );
  }
}
