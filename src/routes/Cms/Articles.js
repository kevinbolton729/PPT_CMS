import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Button, Row, Col, Table, Form, Upload, Icon, Input, Checkbox, Radio } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import moment from 'moment';
// 组件
import ReactQuill from 'react-quill'; // 富文本编辑器
import { options as quillOptions } from '@/utils/quillOptions';
import { openModal, openConfirm } from '@/components/Modal';
import DetailHandler from '@/components/Handler/DetailHandler';
// 样式
// import styles from './Channels.less';
// 常量
import {
  API_DOMAIN,
  URL_PREFIX,
  BTN_SAVE,
  BTN_CANCEL,
  BTN_RESET,
  MODEL_DEL_TITLE,
  MODEL_DEL_DESCRIPTION,
  MODEL_DEL_BTN_OK,
  MODEL_ADDEDIT_TITLE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_WIDTH_EDIT,
} from '@/utils/consts';
// 方法
import {
  strToUpper,
  getMapTypeName,
  getMapStrName,
  getUploadImgs,
  beforeUpload,
} from '@/utils/fns';

const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const filterKeyMap = {
  all: -1,
  product: '产品中心',
  article: '最新动态',
};

class AllArticle extends PureComponent {
  constructor(props) {
    super(props);
    const { channeltypes } = props;

    this.state = {
      visible: false,
      filterValue: 'all',
    };

    // react-quill 编辑器
    this.quillRef = null; // Quill instance
    this.reactQuillRef = null; // ReactQuill component

    this.handleStatus = 0; // 0:添加 1:编辑

    // 列表项数据
    this.recordData = {};

    // 传入Modal的site data
    this.passSites = props.sitetypes.map(item => ({
      label: item.name,
      value: item.siteid,
    }));
    // 传入Modal的channel data
    this.noignore = ['5a9f87cdd2467c1d20c8ca64', '5a9f87e1d2467c1d20c8ca65'];
    this.passChannels = props.channeltypes
      .map(item => ({
        label: item.name,
        value: item.channelid,
      }))
      .filter(item => item.value === this.noignore[0] || item.value === this.noignore[1]);

    this.columns = [
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        render: text => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{text}</span>,
      },
      {
        title: '所属栏目',
        dataIndex: 'channelid',
        key: 'channelid',
        render: text => getMapTypeName(text.split(','), channeltypes),
      },
      {
        title: '发布/更新日期',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 240,
        render: (text, record) => (
          <span>
            {`${moment(parseInt(record.updateDate, 10)).format('YYYY年MM月DD日 HH:mm:ss')}`}
          </span>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 180,
        render: (text, record) => {
          return (
            <div>
              <Button onClick={this.handlerEdit.bind(this, record)}>编辑</Button>
              <Divider type="vertical" />
              <Button
                onClick={this.handlerDelete.bind(this, record.articleid)}
                style={{ marginTop: '12px' }}
                type="primary"
              >
                删除
              </Button>
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {
    const key = this.props.location.query ? this.props.location.query.key : -1;
    if (key === -1) {
      this.props.dispatch({
        type: 'article/queryArticleLists',
      });
    } else {
      this.handleOnChange(key);
    }
  }

  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();
  }

  // Pagination
  onShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize);
  };

  // react-quill 获取编辑器实例
  attachQuillRefs = () => {
    // console.log(this.reactQuillRef, 'this.reactQuillRef');
    if (!this.reactQuillRef) return;
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    this.quillRef = this.reactQuillRef.getEditor();
  };
  // react-quill 插入内容至编辑器
  uploadImgs = (handleStatus, passApiData) => {
    const { dispatch } = this.props;
    // 实例化react-quill
    // this.attachQuillRefs();
    const content = this.quillRef.getContents();
    // console.log(content, 'content');
    // 获取编辑器内的本地图片
    const uploadLists = getUploadImgs(content.ops);
    // 创建form对象
    const formData = new FormData();
    for (let i = 0; i < uploadLists.length; i += 1) {
      formData.append(
        'articleImages',
        uploadLists[i],
        `${uploadLists[i].size};${moment().valueOf()}`
      );
    }

    dispatch({
      type: 'article/uploadArticleImage',
      payload: { formData, contentOps: content.ops, handleStatus, passApiData },
    });
  };

  // Radio onChange
  handleOnChange = async (event) => {
    // console.log(event, 'event/key');
    await this.setState({
      filterValue: event.target ? event.target.value : event,
    });
    await this.resetData();
    await this.filterData(event.target ? filterKeyMap[event.target.value] : filterKeyMap[event]);
  };

  // filter data
  filterData = (key) => {
    if (key === -1) {
      this.resetData();
      return;
    }
    if (key && key.indexOf('SELECTDATE') !== -1) {
      const newKey = key.slice('SELECTDATE'.length + 1);
      // console.log(newKey, 'newKey');
      this.filterSelectDate(newKey);
      return;
    }
    const newKey = key.toString().toUpperCase();
    const { dispatch, data, channeltypes } = this.props;
    const result = data.filter((item) => {
      const arrs = getMapStrName(item.channelid.split(','), channeltypes);
      return (
        arrs.some(arr => strToUpper(arr).indexOf(newKey) !== -1) ||
        strToUpper(item.title).indexOf(newKey) !== -1
      );
    });

    // console.log(result, 'result filterData');
    dispatch({
      type: 'article/getArticleLists',
      payload: result,
    });
  };

  // filter date 日期
  filterSelectDate = (key) => {
    const arr = key.split(',');
    const start = moment(arr[0]).valueOf();
    const end = moment(arr[1]).valueOf();
    const { dispatch, data } = this.props;
    const result = data.filter((item) => {
      const select = parseInt(item.updateDate, 10);
      return select >= start && select <= end;
    });

    dispatch({
      type: 'article/getArticleLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = (noSetState = false) => {
    const { dispatch, originalData } = this.props;

    if (noSetState) {
      this.setState({
        filterValue: 'all',
      });
    }
    dispatch({
      type: 'article/getArticleLists',
      payload: originalData,
    });
  };
  // 操作
  // 添加
  handlerAdd = () => {
    console.log('添加');
    this.handleStatus = 0;
    this.recordData = {};
    this.showModal();
  };
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    this.handleStatus = 1;
    this.recordData = { ...record };
    this.showModal();
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
      type: 'article/delArticle',
      payload: record,
    });
  };
  // submit
  handleSubmit = (e) => {
    e.preventDefault();
    const { confirmLoading, form } = this.props;

    if (!confirmLoading) {
      const quillContent = form.getFieldsValue(['content']).content;
      // console.log(quillContent, 'quillContent');

      if (quillContent === '<p><br></p>') form.setFieldsValue({ content: '' });

      form.validateFields({ force: true }, (err, values) => {
        const { dispatch, uploadImage } = this.props;
        // console.log(values.channel, 'values.channel');
        // console.log(Boolean(uploadImage));
        // console.log(Boolean(this.recordData.thumb));
        if (!err) {
          // 传递给api
          const passApiFormData = {
            siteid: values.site.join(','),
            title: values.title,
            subtitle: values.subtitle,
            channel: values.channel,
            author: values.author,
            source: values.source,
            content: values.content,
            likenums: values.likenums,
            thumb: uploadImage || '',
            isUploadThumbed: !!uploadImage || !!this.recordData.thumb,
            productParmas: values.productParmas,
          };
          // 编辑时，添加字段: articleid
          if (this.handleStatus) passApiFormData.articleid = this.recordData.articleid;
          // react-quill 上传编辑器内图片至文件服务器
          this.uploadImgs(this.handleStatus, passApiFormData);

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
          // if (!this.handleStatus) {
          //   console.log(passApiFormData, 'passApiFormData');
          //   this.uploadImgs(this.handleStatus);
          //   // 添加文章
          //   dispatch({
          //     type: 'article/addArticle',
          //     payload: passApiFormData,
          //   });
          // } else {
          //   passApiFormData.articleid = this.recordData.articleid;
          //   console.log(passApiFormData, 'passApiFormData');
          //   // 编辑文章
          //   dispatch({
          //     type: 'article/editArticle',
          //     payload: passApiFormData,
          //   });
          // }
        } else {
          dispatch({
            type: 'article/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'article/changeConfirmLoading',
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
    this.props.form.resetFields([
      'title',
      'subtitle',
      'channel',
      'source',
      'author',
      'likenums',
      'site',
      'productParmas',
    ]);
    this.props.dispatch({
      type: 'article/changeUpLoadImage',
      payload: '',
    });
    // react-quill 重置内容
    this.quillRef.setContents(this.recordData.content);
  };
  // show Modal
  showModal = () => {
    this.setState({ visible: true });
    this.props.dispatch({
      type: 'article/changeUpLoadImage',
      payload: '',
    });
    this.props.dispatch({
      type: 'article/changeConfirmLoading',
      payload: false,
    });
    setTimeout(() => {
      // 实例化react-quill
      this.attachQuillRefs();
      if (this.recordData.content) this.quillRef.setContents(this.recordData.content);
    }, 1500);
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // 自定义上传 缩略图
  uploadThumb = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'article/uploadThumb',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'article/changeUpLoading',
        payload: false,
      });
    }
  };

  // Radio选中项变化时
  changeRadio = (e) => {
    e.preventDefault();
    const checked = e.target.value;
    this.recordData.channelid = checked;
  };

  render() {
    const { loading, confirmLoading, data, form, uploading, uploadImage } = this.props;
    const { getFieldDecorator } = form;
    const { visible, filterValue } = this.state;
    const passChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            {this.recordData.channelid === '5a9f87e1d2467c1d20c8ca65' && (
              <Col span={24}>
                {/* <span>{`${URL_PREFIX}${uploadImage || this.recordData.thumb}`}</span> */}
                <FormItem label="产品缩略图">
                  {getFieldDecorator('productThumb')(
                    <Upload
                      name="productThumb"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/producthumb`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadThumb}
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
                          '更新/上传缩略图'
                        )}
                      </Button>
                    </Upload>
                  )}
                  {(this.recordData.thumb || uploadImage) && (
                    <img
                      src={`${URL_PREFIX}${uploadImage || this.recordData.thumb}`}
                      style={{ maxWidth: '50%', marginTop: '6px', display: 'block' }}
                      alt="缩略图"
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={24}>
              <FormItem label="标题">
                {getFieldDecorator('title', {
                  initialValue: this.recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写文章标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={this.recordData.channelid === '5a9f87e1d2467c1d20c8ca65' ? 12 : 24}>
              <FormItem label="副标题">
                {getFieldDecorator('subtitle', {
                  initialValue: this.recordData.subtitle || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写文章副标题！',
                    },
                  ],
                })(
                  <TextArea
                    size="large"
                    rows={4}
                    style={{
                      width:
                        this.recordData.channelid === '5a9f87e1d2467c1d20c8ca65' ? '96%' : '100%',
                    }}
                  />
                )}
              </FormItem>
            </Col>
            {this.recordData.channelid === '5a9f87e1d2467c1d20c8ca65' && (
              <Col span={12}>
                <FormItem label="详细参数">
                  {getFieldDecorator('productParmas', {
                    initialValue: this.recordData.params || '',
                    rules: [
                      {
                        message: '请填写产品详细！',
                      },
                    ],
                  })(<TextArea size="large" rows={4} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            <Col span={24}>
              {/* <FormItem label="所属栏目">
                {getFieldDecorator('channel', {
                  initialValue: this.recordData.channelid
                    ? this.recordData.channelid.split(',')
                    : ['59699396682e0924f818c8b8'],
                  rules: [
                    {
                      required: true,
                      message: '请选择所属栏目！',
                    },
                  ],
                })(<CheckboxGroup options={this.passChannels} />)}
              </FormItem> */}
              <FormItem label="所属栏目">
                {/* {console.log(
                  this.recordData.channelid && this.recordData.channelid.split(',')[0],
                  'this.recordData.channelid'
                )} */}
                {getFieldDecorator('channel', {
                  initialValue: this.recordData.channelid,
                  rules: [
                    {
                      required: true,
                      message: '请选择所属栏目！',
                    },
                  ],
                })(
                  <RadioGroup
                    name="channelGroup"
                    options={this.passChannels}
                    onChange={this.changeRadio}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="内容(图片宽度请小于1000px)">
                {getFieldDecorator('content', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: '请输入文章正文内容...',
                    },
                  ],
                })(
                  <ReactQuill
                    ref={(el) => {
                      this.reactQuillRef = el;
                    }}
                    {...quillOptions}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="来源">
                {getFieldDecorator('source', {
                  initialValue: this.recordData.source || '',
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="作者">
                {getFieldDecorator('author', {
                  initialValue: this.recordData.author || '',
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="点击次数">
                {getFieldDecorator('likenums', {
                  initialValue: this.recordData.likenums || '',
                })(<Input size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="发布至">
                {getFieldDecorator('site', {
                  initialValue: this.recordData.siteid
                    ? this.recordData.siteid.split(',')
                    : ['59607e3c682e090ca074ecfd'],
                  rules: [
                    {
                      required: true,
                      message: '请选择将发布至的站点！',
                    },
                  ],
                })(<CheckboxGroup disabled options={this.passSites} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">添加/编辑</span>
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
        <PageHeaderLayout />
        <DetailHandler filterData={this.filterData} resetData={this.resetData.bind(this, true)} />
        <Divider />
        <div>
          <Radio.Group
            style={{ float: 'left' }}
            value={filterValue}
            defaultValue={filterValue}
            onChange={this.handleOnChange}
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="product">产品中心</Radio.Button>
            <Radio.Button value="article">最新动态</Radio.Button>
          </Radio.Group>
          <Button style={{ float: 'right' }} type="primary" size="large" onClick={this.handlerAdd}>
            添加新内容
          </Button>
        </div>
        <div style={{ marginTop: '88px' }}>
          <Table
            rowKey="articleid"
            columns={this.columns}
            loading={loading}
            dataSource={data}
            expandedRowRender={record => (
              <p style={{ margin: 0 }}>{`副标题: ${record.subtitle}`}</p>
            )}
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

export default connect(({ global, article }) => ({
  sitetypes: global.sitetypes,
  channeltypes: global.channeltypes,
  loading: article.loading,
  uploading: article.uploading,
  uploadImage: article.uploadImage,
  confirmLoading: article.confirmLoading,
  originalData: article.originalData,
  data: article.data,
}))(Form.create()(AllArticle));
