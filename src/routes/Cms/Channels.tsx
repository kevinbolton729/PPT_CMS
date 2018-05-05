import { Button, Checkbox, Col, Divider, Form, Icon, Input, Row, Table, Upload } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import * as React from 'react';
// 组件
import BreadCrumb from '../../components/BreadCrumb';
import DetailHandler from '../../components/Handler/DetailHandler';
import { openConfirm, openModal } from '../../components/Modal';
// 常量
import {
  API_DOMAIN,
  BTN_CANCEL,
  BTN_RESET,
  BTN_SAVE,
  LINK_SHOP_ID,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_ADDEDIT_TITLE,
  MODEL_DEL_BTN_OK,
  MODEL_DEL_DESCRIPTION,
  MODEL_DEL_TITLE,
  MODEL_WIDTH_EDIT,
  URL_PREFIX,
} from '../../utils/consts';
// 方法
import { beforeUpload, getMapStrName, getMapTypeName, strToUpper } from '../../utils/fns';
// 声明
import { IChannelProps as IProps, IChannelStates as IStates } from './';

// 样式
// const styles = require('./Channels.less');
const { TextArea }: any = Input;

let handleStatus = 0; // 0:添加 1:编辑

// 表格 列表项 数据
let recordData: any = {};
// 表格 列表项
let columns = (fn: any, props: any) => [
  {
    title: '栏目名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (text: any) => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{text}</span>,
  },
  {
    title: '栏目介绍',
    dataIndex: 'text',
    key: 'text',
    width: 300,
    render: (text: any) => <span style={{ color: '#999' }}>{text}</span>,
  },
  {
    title: '所属站点',
    dataIndex: 'siteid',
    key: 'siteid',
    render: (text: any) => getMapTypeName(text.split(','), props.sitetypes),
  },
  {
    title: '更新日期',
    dataIndex: 'updateDate',
    key: 'updateDate',
    width: 300,
    render: (text: any, record: any) => (
      <span>{`${moment(parseInt(record.updateDate, 10)).format('YYYY年MM月DD日 HH:mm:ss')}`}</span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 220,
    render: (text: any, record: any) => {
      return (
        <div>
          <Button onClick={fn.handlerEdit.bind(null, record)}>编辑</Button>
          {(record.channelid === '5a9f87cdd2467c1d20c8ca64' ||
            record.channelid === '5a9f87e1d2467c1d20c8ca65') && (
            <div style={{ display: 'inline' }}>
              <Divider type="vertical" />
              <Button
                onClick={fn.handlerSelect.bind(null, record.channelid)}
                style={{ marginTop: '12px' }}
                type="primary"
              >
                进入栏目
              </Button>
            </div>
          )}
          {/* <Divider type="vertical" />
              <Button
                onClick={this.handlerDelete.bind(this, record.channelid)}
                style={{ marginTop: '12px' }}
                type="primary"
              >
                删除
              </Button> */}
        </div>
      );
    },
  },
];

let passSites: any[] = [];

@connect(({ global, channel }: any) => ({
  currentSiteid: global.currentSiteid,
  sitetypes: global.sitetypes,
  loading: channel.loading,
  uploading: channel.uploading,
  uploadImage: channel.uploadImage,
  confirmLoading: channel.confirmLoading,
  originalData: channel.originalData,
  data: channel.data,
}))
class SetChannel extends React.PureComponent<IProps, IStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'channel/queryChanneLists',
    });
  }
  componentDidMount() {
    const { sitetypes } = this.props;
    // 传入Modal的site data
    passSites = sitetypes
      .map((item: any, index: any) => ({
        key: `site${index}`,
        label: item.name,
        value: item.siteid,
      }))
      .filter((item: any) => item.label);
  }
  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();
  }

  // Pagination
  onShowSizeChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
  };

  // filter data
  filterData = (key: string) => {
    if (key.indexOf('SELECTDATE') !== -1) {
      const newKey = key.slice('SELECTDATE'.length + 1);
      // console.log(newKey, 'newKey');
      this.filterSelectDate(newKey);
      return;
    }
    const newKey = key.toString().toUpperCase();
    const { dispatch, data, sitetypes } = this.props;
    const result = data.filter(item => {
      const arrs = getMapStrName(item.siteid.split(','), sitetypes);
      return (
        arrs.some(arr => strToUpper(arr).indexOf(newKey) !== -1) ||
        strToUpper(item.name).indexOf(newKey) !== -1
      );
    });

    dispatch({
      type: 'channel/getChanneLists',
      payload: result,
    });
  };

  // filter date 日期
  filterSelectDate = (key: string) => {
    const arr = key.split(',');
    const start = moment(arr[0]).valueOf();
    const end = moment(arr[1]).valueOf();
    const { dispatch, data } = this.props;
    const result = data.filter(item => {
      const select = parseInt(item.updateDate, 10);
      return select >= start && select <= end;
    });

    dispatch({
      type: 'channel/getChanneLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = () => {
    const { dispatch, originalData } = this.props;

    dispatch({
      type: 'channel/getChanneLists',
      payload: originalData,
    });
  };
  // 操作
  // 添加
  handlerAdd = () => {
    console.log('添加');
    handleStatus = 0;
    recordData = {};
    this.showModal();
  };
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    handleStatus = 1;
    recordData = { ...record };
    this.showModal();
  };
  // 选择进入
  handlerSelect = (channelid = '') => {
    if (!channelid) return;
    // console.log(channelid, 'channelid');
    const { dispatch } = this.props;
    const filterKey = {
      '5a9f87cdd2467c1d20c8ca64': 'article',
      '5a9f87e1d2467c1d20c8ca65': 'product',
    };
    dispatch({
      type: 'global/goto',
      payload: { url: '/cms/articles', key: filterKey[channelid] },
    });
  };
  // 删除
  handlerDelete = (record = {}) => {
    openConfirm({
      title: MODEL_DEL_TITLE,
      content: MODEL_DEL_DESCRIPTION,
      okText: MODEL_DEL_BTN_OK,
      cancelText: BTN_CANCEL,
      okType: 'primary',
      onOk: this.doDelete.bind(this, record),
    });
  };
  // 执行删除
  doDelete = (record = {}) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'channel/delChannel',
      payload: record,
    });
  };
  // submit
  handleSubmit = (event: any) => {
    event.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err: any, values: any) => {
        const { dispatch, uploadImage } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // console.log(values.setHref, 'values.setHref');
          // return;
          // 传递给api
          const passApiFormData: any = {
            name: values.name,
            text: values.subtitle,
            thumb: uploadImage || '',
            siteid: values.site.join(','),
            href: values.href,
            setHref: parseInt(
              values.setHref && values.setHref.length
                ? values.setHref[values.setHref.length - 1]
                : 0,
              10
            ),
          };
          if (!handleStatus) {
            // console.log(passApiFormData, 'passApiFormData');
            // 添加栏目
            dispatch({
              type: 'channel/addChannel',
              payload: passApiFormData,
            });
          } else {
            passApiFormData.channelid = recordData.channelid;
            // console.log(passApiFormData, 'passApiFormData');
            // 编辑栏目
            dispatch({
              type: 'channel/editChannel',
              payload: passApiFormData,
            });
          }

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'channel/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'channel/changeConfirmLoading',
              payload: false,
            });
          }, 1500);
        }
      });
    }
  };
  // 重置
  handleReset = () => {
    console.log('重置');
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'channel/changeUpLoadImage',
      payload: '',
    });
  };
  // show Modal
  showModal = () => {
    this.setState({ visible: true });
    this.props.dispatch({
      type: 'channel/changeUpLoadImage',
      payload: '',
    });
    // console.log(handleStatus, 'handleStatus');
    console.log(recordData, 'recordData');
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // 自定义上传 栏目
  uploadChannel = (event: any) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'channel/uploadChannel',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'channel/changeUpLoading',
        payload: false,
      });
    }
  };

  render() {
    const { loading, confirmLoading, data, form, uploading, uploadImage } = this.props;
    const { getFieldDecorator } = form;
    const { visible } = this.state;
    const passChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            {recordData.channelid !== LINK_SHOP_ID && (
              <Col span={24}>
                <Form.Item label="栏目图片">
                  {getFieldDecorator('channelImage')(
                    <Upload
                      name="channelImage"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/channelimages`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadChannel}
                    >
                      <Button disabled={uploading !== false}>
                        <Icon type={uploading && uploading === 'loading' ? 'loading' : 'plus'} />{' '}
                        {uploading ? (
                          uploading === 'loading' ? (
                            '上传中...'
                          ) : (
                            <span className="uploadSuccess">
                              {uploading === 'error' ? '上传失败' : '上传成功'}
                            </span>
                          )
                        ) : (
                          '更新/上传栏目图片'
                        )}
                      </Button>
                    </Upload>
                  )}
                  {(uploadImage || recordData.thumb) && (
                    <img
                      src={`${URL_PREFIX}${uploadImage || recordData.thumb}`}
                      style={{ maxWidth: '100%', marginTop: '6px', display: 'block' }}
                      alt="栏目图片"
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item label="标题">
                {getFieldDecorator('name', {
                  initialValue: recordData.name || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写栏目标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="简介">
                {getFieldDecorator('subtitle', {
                  initialValue: recordData.text || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写栏目简介！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </Form.Item>
            </Col>
          </Row>
          {recordData.channelid === LINK_SHOP_ID && (
            <Row>
              <Col span={18}>
                <Form.Item label="访问地址">
                  {getFieldDecorator('href', {
                    initialValue: recordData.href || '',
                    rules: recordData.channelid === LINK_SHOP_ID && [
                      {
                        required: true,
                        message: '请填写访问地址！',
                      },
                    ],
                  })(<Input addonBefore="Http://" size="large" style={{ width: '96%' }} />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="启用地址">
                  {getFieldDecorator('setHref', {
                    initialValue: ['1'],
                    rules: recordData.channelid === LINK_SHOP_ID && [
                      {
                        required: true,
                        message: '请选择是否启用！',
                      },
                    ],
                  })(
                    <Checkbox.Group disabled={true} options={[{ label: '是否启用', value: '1' }]} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row>
            <Col span={24}>
              <Form.Item label="发布至">
                {getFieldDecorator('site', {
                  initialValue: recordData.siteid
                    ? recordData.siteid.split(',')
                    : ['59607e3c682e090ca074ecfd'],
                  rules: [
                    {
                      required: true,
                      message: '请选择将发布至的站点！',
                    },
                  ],
                })(<Checkbox.Group disabled={true} options={passSites} />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">编辑栏目</span>
              </Divider>
              <Button onClick={this.handleReset}>{BTN_RESET}</Button>
              <Divider type="vertical" />
              <Button loading={confirmLoading} type="primary" htmlType="submit">
                {BTN_SAVE}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    );

    return (
      <div>
        {openModal.apply(this, [
          {
            title: MODEL_ADDEDIT_TITLE,
            width: MODEL_WIDTH_EDIT,
            content: MODEL_ADDEDIT_DESCRIPTION,
            children: passChildren,
            visible,
            closable: true,
            confirmLoading,
            footer: null,
          },
        ])}
        <div className="componentBackground">
          <BreadCrumb />
        </div>
        <DetailHandler filterData={this.filterData} resetData={this.resetData} />
        <Divider />
        {/* <div>
          <Button style={{ float: 'right' }} type="primary" size="large" onClick={this.handlerAdd}>
            添加新栏目
          </Button>
        </div> */}
        {/* 显示【添加新栏目】按钮时，请设置 { marginTop: '88px' } */}
        <div style={{ marginTop: '24px' }}>
          <Table
            rowKey="channelid"
            columns={columns(
              {
                handlerEdit: this.handlerEdit,
                handlerSelect: this.handlerSelect,
              },
              this.props
            )}
            loading={loading}
            dataSource={data}
            // expandedRowRender={record => <p style={{ margin: 0 }}>{`栏目简介: ${record.text}`}</p>}
            pagination={{
              size: 'small',
              showSizeChanger: true,
              defaultCurrent: 1,
              defaultPageSize: 20,
              pageSizeOptions: ['10', '20', '30', '50'],
              total: 0,
              onShowSizeChange: this.onShowSizeChange,
            }}
          />
        </div>
      </div>
    );
  }
}

export default Form.create()(SetChannel) as any;
