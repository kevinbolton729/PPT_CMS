import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Icon, Upload, Divider, Button, Form, Input } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
// import moment from 'moment';
// 组件
import { openModal } from '@/components/Modal';
// 常量
import {
  URL_PREFIX,
  BTN_SAVE,
  BTN_RESET,
  MODEL_ADDEDIT_TITLE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_WIDTH_EDIT,
  ADVER_NOTITLE,
  IMAGE_NODESCRIPTION,
} from '@/utils/consts';
// 方法
import { beforeUpload, beforeUploadVideo } from '@/utils/fns';
// 样式
import styles from './Advers.less';

const { Meta } = Card;
const FormItem = Form.Item;
const { TextArea } = Input;

class Adver extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    // 当前操作项ID值
    this.currentid = null;
    // 当前操作项的weight值
    this.currentWeight = null;
    // 列表项数据
    this.recordData = {};
  }
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'adver/queryAdverLists',
    });
  }
  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();
  }

  // 点击上传按钮后
  clicked = (weight, id) => {
    this.currentWeight = weight;
    this.currentid = id;
  };
  // submit
  handleSubmit = (event) => {
    // console.log('submit');
    event.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err, values) => {
        const { dispatch } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // 传递给api
          const passApiFormData = {
            title: values.title,
            description: values.description,
            url: this.recordData.url || '',
            topath: values.topath,
          };
          passApiFormData.id = this.recordData.id;
          // console.log(passApiFormData, 'passApiFormData');
          // 编辑广告图片
          dispatch({
            type: 'adver/editAdver',
            payload: passApiFormData,
          });

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'adver/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'adver/changeConfirmLoading',
              payload: false,
            });
          }, 1500);
        }
      });
    }
  };
  // 重置
  handleReset = () => {
    // console.log('重置');
    this.props.form.resetFields(['title', 'description', 'topath']);
  };
  // show Modal
  showModal = () => {
    // console.log('show Modal');
    this.setState({ visible: true });
  };
  // close Modal
  closeModal = () => {
    // console.log('close Modal');
    this.setState({ visible: false });
  };

  // 自定义上传 广告图片
  uploadAdver = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', this.currentWeight);

    dispatch({
      type: 'adver/uploadAdver',
      payload: formData,
    });
  };
  // 自定义上传 广告视频
  uploadVideo = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', this.currentWeight);

    dispatch({
      type: 'adver/uploadVideo',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'adver/changeUpLoading',
        payload: false,
      });
    }
  };

  // 操作
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    this.recordData = { ...record };
    this.showModal();
  };

  render() {
    // const { url1, url2, url3 } = this.state;
    const { loading, data, confirmLoading, form, uploading } = this.props;
    const { getFieldDecorator } = form;
    const { visible } = this.state;
    // console.log(data, 'data');
    const passChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col span={12}>
              <FormItem label="标题">
                {getFieldDecorator('title', {
                  initialValue: this.recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写广告图标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="跳转地址">
                {getFieldDecorator('topath', {
                  initialValue: this.recordData.topath || '',
                  rules: [
                    {
                      required: this.recordData.isVideo !== 1,
                      message: '请填写广告跳转地址！',
                    },
                  ],
                })(<Input addonBefore="Http://" size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem label="描述">
                {getFieldDecorator('description', {
                  initialValue: this.recordData.description || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写广告描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">编辑广告图片/视频信息</span>
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
        <div style={{ marginTop: '24px' }}>
          <Row>
            {data.reduce((arr, current) => {
              const htmlNode = (
                <Col xs={24} sm={24} md={12} lg={12} xl={6} xxl={6} key={current.id}>
                  <div className={styles.uploadImage}>
                    <Card
                      title={
                        current.isVideo !== 1 ? `A000${current.weight}` : `V0${current.weight}`
                      }
                      style={{ width: '100%' }}
                      loading={loading}
                      cover={
                        current.url ? (
                          <img alt="example" src={`${URL_PREFIX}${current.url}`} />
                        ) : (
                          <span className={styles.noImage} />
                        )
                      }
                      actions={[
                        <Button
                          className={styles.uploadBtn}
                          onClick={this.handlerEdit.bind(this, current)}
                        >
                          <Icon type="edit" />
                        </Button>,
                        <Upload
                          name={current.isVideo !== 1 ? 'adverImage' : 'homeVideo'}
                          showUploadList={false}
                          beforeUpload={current.isVideo !== 1 ? beforeUpload : beforeUploadVideo}
                          customRequest={
                            current.isVideo !== 1 ? this.uploadAdver : this.uploadVideo
                          }
                          disabled={this.currentid === current.id && uploading}
                        >
                          <Button
                            className={styles.uploadBtn}
                            onClick={this.clicked.bind(this, current.weight, current.id)}
                          >
                            {this.currentid === current.id && uploading ? (
                              <Icon type="loading">上传中...</Icon>
                            ) : (
                              <Icon type="upload" />
                            )}
                          </Button>
                        </Upload>,
                      ]}
                    >
                      {
                        <Meta
                          title={current.title || ADVER_NOTITLE}
                          description={current.description || IMAGE_NODESCRIPTION}
                        />
                      }
                    </Card>
                  </div>
                </Col>
              );
              arr.push(htmlNode);
              return arr;
            }, [])}
          </Row>
        </div>
      </div>
    );
  }
}

export default connect(({ adver }) => ({
  loading: adver.loading,
  originalData: adver.originalData,
  data: adver.data,
  uploading: adver.uploading,
  confirmLoading: adver.confirmLoading,
}))(Form.create()(Adver));
