import React from 'react';
import PropTypes from 'prop-types';
import {
  Layout,
  Row,
  Col,
  Form,
  Input,
  Icon,
  Divider,
  Button,
  message,
  Radio,
  Avatar,
  Upload,
} from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import SiderMenu from '@/components/SiderMenu';
import NotFound from '@/routes/Exception/404';
import { getRoutes } from '@/utils/utils';
import Authorized from '@/utils/Authorized';
import { getMenuData } from '@/common/menu';
// import logo from '@/assets/logo.svg';
// 组件
import { openModal, openConfirm } from '@/components/Modal';
// import { FirstPage } from '@/components/Other/FirstPage';

// 样式
import styles from '@/layouts/BasicLayout.less';

// 常量
import {
  LOGO_PAGE,
  URL_PREFIX,
  API_DOMAIN,
  DOCUMENTITLE,
  COLLAPSEDWIDTH,
  NOCOLLAPSEDWIDTH,
  HEADERFIXTOP,
  BTN_SAVE,
  BTN_RESET,
  BTN_CANCEL,
  BTN_CHANGE,
  FORM_EDIT_PWD_BTN,
  MODEL_CHANGESELECTEDSITE_TITLE,
  MODEL_USERCENTER_TITLE,
  MODEL_SECURIY_TITLE,
  MODEL_SECURIY_DESCRIPTION,
  MODEL_LOGINOUT_TITLE,
  MODEL_LOGINOUT_DESCRIPTION,
  MODEL_LOGINOUT_BTN_OK,
  MESSAGE_CHANGESELECTEDSITE_NOSELECT,
} from '@/utils/consts';
// 方法
import { beforeUpload } from '@/utils/fns';

const logo = LOGO_PAGE;

const { Content } = Layout;
const { AuthorizedRoute } = Authorized;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `/${item.path}`,
        to: `/${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});
const isMounted = { status: true };

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
    currentUser: PropTypes.object,
    dispatch: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {
      // isloaded: false,
      isMobile,
      visible: false,
      // Modal Form
      // 0: 安全中心 1:切换站点 2:个人中心
      modalSort: 0,
      // portrait loading
      // portraitLoading: false,
    };
  }

  getChildContext() {
    const { location, routerData, currentUser, dispatch } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
      currentUser,
      dispatch,
    };
  }

  componentWillMount() {
    const { dispatch, currentSiteid } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'global/querySiteTypes',
    });
    dispatch({
      type: 'global/queryChannelTypes',
      payload: {
        siteid: currentSiteid,
      },
    });
  }

  componentDidMount() {
    enquireScreen((mobile) => {
      if (isMounted.status) {
        this.setState({
          isMobile: mobile,
        });
      }
    });

    // document.onreadystatechange = this.listen;
  }
  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();

    // document.onreadystatechange = this.listen;
  }
  componentWillUnmount() {
    isMounted.status = false;
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = DOCUMENTITLE;
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - ${DOCUMENTITLE}`;
    }
    return title;
  }
  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      return '/dashboard/workspace';
    }
    return redirect;
  };
  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  // listen = () => {
  //   if (document.readyState === 'complete') {
  //     // 资源加载完成
  //     this.setState({
  //       isloaded: true,
  //     });
  //   }
  // };
  // handleNoticeClear = (type) => {
  //   message.success(`清空了${type}`);
  //   this.props.dispatch({
  //     type: 'global/clearNotices',
  //     payload: type,
  //   });
  // };

  // Form
  // validate password
  validatePwd = (items) => {
    const { oldpwd, newpwd, confirmpwd } = items;
    const pattrnPwd = /^[a-zA-Z0-9]{4,16}$/;

    if (oldpwd === '') {
      return '请输入密码';
    }
    if (newpwd === '') {
      return '请输入新密码';
    }
    if (newpwd === oldpwd) {
      return '新密码不得与旧密码重复';
    }
    if (newpwd !== confirmpwd) {
      return '两次输入的密码不一致';
    }
    if (!pattrnPwd.test(newpwd) || !pattrnPwd.test(oldpwd)) {
      return '输入的密码格式不正确';
    }

    return false;
  };
  // submit 修改密码
  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields(
        ['oldpwd', 'newpwd', 'confirmpwd'],
        { force: true },
        (err, values) => {
          if (!err) {
            const { oldpwd, newpwd } = values;
            const { dispatch } = this.props;
            const validater = this.validatePwd(values);
            const payload = { oldpwd, newpwd };

            if (!validater) {
              dispatch({
                type: 'user/editPassword',
                payload,
              });
            } else {
              message.error(validater);
              dispatch({
                type: 'user/changeConfirmLoading',
                payload: true,
              });
              setTimeout(() => {
                dispatch({
                  type: 'user/changeConfirmLoading',
                  payload: false,
                });
              }, 3000);
            }
          }
        }
      );
    }
  };
  // submit 切换站点
  submitChange = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const selectedSiteid = form.getFieldValue('changesite');
    // console.log(selectedSiteid, 'selectedSiteid');

    if (selectedSiteid) {
      dispatch({
        type: 'global/changeSelectedSite',
        payload: selectedSiteid,
      });

      // 关闭Modal
      setTimeout(() => {
        this.closeModal();
      }, 500);
    } else {
      message.error(MESSAGE_CHANGESELECTEDSITE_NOSELECT);
    }
  };
  // submit 修改个人中心
  submitUser = (e) => {
    e.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields(
        ['nickname', 'sex', 'tel', 'email'],
        { force: true },
        (err, values) => {
          const { dispatch } = this.props;
          if (!err) {
            const { nickname, sex, tel, email } = values;
            // 传递给api
            const passApi = { nickname, sex: parseInt(sex, 10), tel, email };
            // console.log(passApi, '传递修改个人中心的api值');
            dispatch({
              type: 'user/editUser',
              payload: passApi,
            });

            // 关闭Modal
            setTimeout(() => {
              this.closeModal();
            }, 500);
          } else {
            dispatch({
              type: 'user/changeConfirmLoading',
              payload: true,
            });
            setTimeout(() => {
              dispatch({
                type: 'user/changeConfirmLoading',
                payload: false,
              });
            }, 3000);
          }
        }
      );
    }
  };

  handleMenuClick = ({ key }) => {
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      this.showLoginout();
      return;
    }
    this.showModal(key);
  };
  handleReset = () => {
    console.log('重置');
    // this.props.form.setFieldsValue({ oldpwd: '', newpwd: '', confirmpwd: '' });
    this.props.form.resetFields();
  };
  // handleNoticeVisibleChange = (visible) => {
  //   if (visible) {
  //     this.props.dispatch({
  //       type: 'global/fetchNotices',
  //     });
  //   }
  // };
  // show Modal
  showModal = (key = 'security') => {
    if (key === 'security') {
      this.setState({ modalSort: 0 });
    }
    if (key === 'changesite') {
      this.setState({ modalSort: 1 });
    }
    if (key === 'usercenter') {
      this.setState({ modalSort: 2 });
    }
    this.setState({ visible: true });
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // show Confirm loginout
  showLoginout = () => {
    openConfirm({
      title: MODEL_LOGINOUT_TITLE,
      content: MODEL_LOGINOUT_DESCRIPTION,
      okText: MODEL_LOGINOUT_BTN_OK,
      cancelText: BTN_CANCEL,
      okType: 'primary',
      onOk: this.doLoginout,
    });
  };

  // loginout
  doLoginout = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/logout',
    });
  };
  // 自定义上传 protrait
  uploadProtrait = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'user/uploadProtrait',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'user/changeUpLoading',
        payload: false,
      });
    }
  };

  render() {
    const {
      currentUser,
      uploading,
      sitetypes,
      collapsed,
      globalConfirmLoading,
      confirmLoading,
      fetchingNotices,
      notices,
      routerData,
      match,
      location,
      copyright,
      form,
      currentSiteid,
    } = this.props;
    // 传入Modal的data
    // site data
    const passSites = sitetypes.map(item => ({
      label: item.name,
      value: item.siteid,
    }));
    // sex data
    const passSex = [{ label: '男', value: '1' }, { label: '女', value: '0' }];
    const { getFieldDecorator } = form;
    const bashRedirect = this.getBashRedirect();
    const marginLeft = collapsed ? COLLAPSEDWIDTH : NOCOLLAPSEDWIDTH;
    // const firstLayout = <FirstPage />;
    const mainLayout = (
      <Layout>
        <SiderMenu
          logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
          Authorized={Authorized}
          menuData={getMenuData()}
          collapsed={collapsed}
          location={location}
          isMobile={this.state.isMobile}
          onCollapse={this.handleMenuCollapse}
        />
        <Layout style={this.state.isMobile ? null : { marginLeft }}>
          <GlobalHeader
            logo={logo}
            currentUser={currentUser}
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            isMobile={this.state.isMobile}
            // onNoticeClear={this.handleNoticeClear}
            onCollapse={this.handleMenuCollapse}
            onMenuClick={this.handleMenuClick}
            // onNoticeVisibleChange={this.handleNoticeVisibleChange}
          />
          {/* 默认: margin: 24px 24px 0 */}
          <Content style={{ margin: `${HEADERFIXTOP}px 24px 0`, height: '100%' }}>
            <div style={{ minHeight: 'calc(100vh - 158px)' }}>
              <Switch>
                {redirectData.map(item => (
                  <Redirect key={item.from} exact from={item.from} to={item.to} />
                ))}
                {getRoutes(match.path, routerData).map(item => (
                  <AuthorizedRoute
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                    authority={item.authority}
                    redirectPath="/exception/403"
                  />
                ))}
                <Redirect exact from="/" to={bashRedirect} />
                <Route render={NotFound} />
              </Switch>
            </div>
          </Content>
          <GlobalFooter copyright={copyright} />
        </Layout>
      </Layout>
    );
    const { visible, modalSort } = this.state;
    // const noticeData = this.getNoticeData();
    const securityChildren = (
      <div style={{ padding: '0 15%' }}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('oldpwd', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入原密码！',
                },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="lock" />}
                type="password"
                placeholder="原密码"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('newpwd', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入新密码！',
                },
              ],
            })(<Input size="large" prefix={<i />} type="password" placeholder="新密码" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirmpwd', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请再次输入新密码！',
                },
              ],
            })(<Input size="large" prefix={<i />} type="password" placeholder="确认密码" />)}
          </FormItem>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">安全中心</span>
              </Divider>
              <Button onClick={this.handleReset}>{BTN_RESET}</Button>
              <Divider type="vertical" />
              <Button loading={confirmLoading} type="primary" htmlType="submit">
                {FORM_EDIT_PWD_BTN}
              </Button>
            </div>
          </FormItem>
        </Form>
      </div>
    );
    const changeSiteChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.submitChange}>
          <FormItem label="切换至">
            {getFieldDecorator('changesite', {
              initialValue: currentSiteid || '',
            })(<RadioGroup options={passSites} />)}
          </FormItem>
          <FormItem>
            <div style={{ marginTop: '-24px', textAlign: 'center' }}>
              <Divider>
                <span className="dividerFont">{MODEL_CHANGESELECTEDSITE_TITLE}</span>
              </Divider>
              <Button loading={globalConfirmLoading} type="primary" htmlType="submit">
                {BTN_CHANGE}
              </Button>
            </div>
          </FormItem>
        </Form>
      </div>
    );

    const userCenterChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.submitUser}>
          <Row>
            <Col span={6}>
              <FormItem label="头像">
                <div className={styles.portrait}>
                  <Avatar size="large" src={`${URL_PREFIX}${currentUser.portrait}`} />
                </div>
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem>
                <div className={styles.upload}>
                  {getFieldDecorator('portrait')(
                    <Upload
                      name="portrait"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/portrait`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadProtrait}
                    >
                      <div style={{ color: '#999' }}>
                        <Icon type={uploading && uploading === 'loading' ? 'loading' : 'plus'} />
                        <span style={{ display: 'block' }}>
                          {uploading ? (
                            uploading === 'loading' ? (
                              '上传中...'
                            ) : (
                              <span className="primaryTheme">上传成功</span>
                            )
                          ) : (
                            '更新头像'
                          )}
                        </span>
                      </div>
                    </Upload>
                  )}
                </div>
              </FormItem>
            </Col>
          </Row>
          <div style={{ marginTop: '-24px' }}>
            <Divider>
              <span className="dividerFont">修改个人信息</span>
            </Divider>
          </div>
          <Row>
            <Col span={12}>
              <FormItem label="昵称">
                {getFieldDecorator('nickname', {
                  initialValue: currentUser.nickname || '',
                  rules: [
                    {
                      required: true,
                      message: '请输入新昵称！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="性别">
                {getFieldDecorator('sex', {
                  initialValue: `${currentUser.sex}` || passSex[0].value,
                  rules: [
                    {
                      required: true,
                      message: '请选择性别！',
                    },
                  ],
                })(<RadioGroup options={passSex} style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="手机号码">
                {getFieldDecorator('tel', {
                  initialValue: currentUser.tel || '',
                  rules: [
                    {
                      required: true,
                      message: '请输入新手机号码！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="电子邮箱">
                {getFieldDecorator('email', {
                  initialValue: currentUser.email || '',
                  rules: [
                    {
                      required: true,
                      message: '请输入新电子邮箱！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">{MODEL_USERCENTER_TITLE}</span>
              </Divider>
              <Button onClick={this.handleReset}>{BTN_RESET}</Button>
              <Divider type="vertical" />
              <Button loading={confirmLoading} type="primary" htmlType="submit">
                {BTN_SAVE}
              </Button>
            </div>
          </FormItem>
        </Form>
      </div>
    );
    // 打开的Modal类型
    const sortModal = {
      0: securityChildren,
      1: changeSiteChildren,
      2: userCenterChildren,
    };
    // Modal 标题
    const titleModal = {
      0: MODEL_SECURIY_TITLE,
      1: MODEL_CHANGESELECTEDSITE_TITLE,
      2: MODEL_USERCENTER_TITLE,
    };
    const passChildren = sortModal[modalSort];

    // const passChildren = modalSort === 0 ? securityChildren : changeSiteChildren;

    return (
      <div>
        {openModal.apply(this, [
          {
            title: titleModal[modalSort],
            content: MODEL_SECURIY_DESCRIPTION,
            children: passChildren,
            visible,
            closable: true,
            confirmLoading,
            footer: null,
          },
        ])}
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{mainLayout}</div>}
          </ContainerQuery>
        </DocumentTitle>
      </div>
    );
  }
}
document.onreadystatechange = BasicLayout.listen;

export default connect(({ user, global, loading }) => ({
  currentUser: user.currentUser,
  uploading: user.uploading,
  globalConfirmLoading: global.globalConfirmLoading,
  confirmLoading: user.confirmLoading,
  currentSiteid: global.currentSiteid,
  collapsed: global.collapsed,
  copyright: global.copyright,
  sitetypes: global.sitetypes,
  channeltypes: global.channeltypes,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(Form.create()(BasicLayout));
