import { Button, Card, Col, Divider, Form, Icon, Input, Row, Upload } from 'antd';
import { connect } from 'dva';
import * as React from 'react';
// import moment from 'moment';
// 组件
import BreadCrumb from '../../components/BreadCrumb';
import { openModal } from '../../components/Modal';
// 常量
import {
  ADVER_NOTITLE,
  BTN_RESET,
  BTN_SAVE,
  IMAGE_NODESCRIPTION,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_ADDEDIT_TITLE,
  MODEL_WIDTH_EDIT,
  URL_PREFIX,
} from '../../utils/consts';
// 方法
import { beforeUpload, beforeUploadVideo } from '../../utils/fns';
// 声明
import { IAdverProps as IProps, IAdverStates as IStates } from './';

// 样式
const styles = require('./Advers.less');

const { Meta }: any = Card;
const { TextArea }: any = Input;

// 当前操作项ID值
let currentid: any = null;
// 当前操作项的weight值
let currentWeight: any = null;
// 列表项数据
let recordData: any = {};

@connect(({ adver }: any) => ({
  loading: adver.loading,
  originalData: adver.originalData,
  data: adver.data,
  uploading: adver.uploading,
  confirmLoading: adver.confirmLoading,
}))
class Adver extends React.PureComponent<IProps, IStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false,
    };
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
  clicked = (weight: number, id: number) => {
    currentWeight = weight;
    currentid = id;
  };
  // submit
  handleSubmit = (event: any) => {
    // console.log('submit');
    event.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err: any, values: any) => {
        const { dispatch } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // 传递给api
          const passApiFormData: any = {
            title: values.title,
            description: values.description,
            url: recordData.url || '',
            topath: values.topath,
          };
          passApiFormData.id = recordData.id;
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
  uploadAdver = (event: any) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', currentWeight);

    dispatch({
      type: 'adver/uploadAdver',
      payload: formData,
    });
  };
  // 自定义上传 广告视频
  uploadVideo = (event: any) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', currentWeight);

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
    recordData = { ...record };
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
              <Form.Item label="标题">
                {getFieldDecorator('title', {
                  initialValue: recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写广告图标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跳转地址">
                {getFieldDecorator('topath', {
                  initialValue: recordData.topath || '',
                  rules: [
                    {
                      required: recordData.isVideo !== 1,
                      message: '请填写广告跳转地址！',
                    },
                  ],
                })(<Input addonBefore="Http://" size="large" style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="描述">
                {getFieldDecorator('description', {
                  initialValue: recordData.description || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写广告描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
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
                          key="button"
                          className={styles.uploadBtn}
                          onClick={this.handlerEdit.bind(this, current)}
                        >
                          <Icon type="edit" />
                        </Button>,
                        <Upload
                          key="upload"
                          name={current.isVideo !== 1 ? 'adverImage' : 'homeVideo'}
                          showUploadList={false}
                          beforeUpload={current.isVideo !== 1 ? beforeUpload : beforeUploadVideo}
                          customRequest={
                            current.isVideo !== 1 ? this.uploadAdver : this.uploadVideo
                          }
                          disabled={currentid === current.id && uploading}
                        >
                          <Button
                            className={styles.uploadBtn}
                            onClick={this.clicked.bind(this, current.weight, current.id)}
                          >
                            {currentid === current.id && uploading ? (
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

export default Form.create()(Adver) as any;
