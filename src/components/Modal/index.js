/*
 * @Author: Kevin Bolton
 * @Date: 2018-01-05 15:10:05
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-02-13 18:42:56
 */
import React from 'react';
import { Modal } from 'antd';

const { confirm } = Modal;

/**
 * @description 封装Confirm
 * @author Kevin Bolton
 * @param {any} [options={}]
 * @api
 * {title}: string [默认: 确认操作] 标题,
 * {content}: string [默认: 是否继续本次操作？] 内容,
 * {iconType}: string [默认: question-circle]
 * {maskClosable}: boolean [默认: false] 点击蒙层是否允许关闭
 * {okText}: string [默认: 确定] 确认按钮文本,
 * {cancelText}: string [默认: 取消] 取消按钮文本,
 * {onOk}: function 点击确认,
 * {onCancel}: function 点击取消,
 */
export function openConfirm(options = {}) {
  const instance = confirm({
    title: options.title || '确认操作',
    content: options.content || '是否继续本次操作？',
    iconType: options.iconType || 'exclamation-circle',
    maskClosable: Boolean(options.maskClosable),
    okType: 'primary',
    okText: options.okText || '确定',
    cancelText: options.cancelText || '取消',
    onOk() {
      console.log('Clicked ok button');
      if (options.onOk) {
        options.onOk();
      }
    },
    onCancel() {
      console.log('Clicked cancel button');
      if (options.onCancel) {
        options.onCancel();
      }
      instance.destroy();
    },
  });
}
/**
 * @description 封装Modal
 * 调用本方法的组件必须绑定this, 且定义组件的state
 * state = {
 *      visible: false, // 必填
 *     confirmLoading: false, // 可选
 *   };
 * @author Kevin Bolton
 * @param {any} [options={}]
 * @returns {ReactNoade|HTML}
 * @api
 * {title}: string [默认: 确认操作] 标题,
 * {width}: string|number [默认: 520] 宽度,
 * {visible}: boolean (必填) 是否打开Modal,
 * {confirmLoading}: boolean [默认: false] (选填) 点击确认按钮的Loading
 * {closable}: boolean [默认: false] 是否显示右上角关闭按钮,
 * {maskClosable}: boolean [默认: false] 点击蒙层是否允许关闭,
 * {okText}: string [默认: 确定] 确认按钮文本,
 * {cancelText}: string [默认: 取消] 取消按钮文本,
 * {handleOk}: function 点击确认,
 * {handleCancel}: function 点击取消,
 * {footer}: array 自定义确认取消按钮 参考Ant->Modal设置
 * {content}: string|number 内容,
 * {children}: ReactNode|Html 子元素 当传入children时，content无效,
 */
export function openModal(options = {}) {
  const newOptions = options;

  if (!newOptions.handleOk) {
    newOptions.handleOk = () => {
      console.log('Clicked ok button');
      this.setState({
        visible: false,
      });
    };
  }
  if (!newOptions.handleCancel) {
    newOptions.handleCancel = () => {
      console.log('Clicked cancel button');
      this.setState({
        visible: false,
      });
    };
  }
  if (!newOptions.afterClose) {
    newOptions.afterClose = null;
  }

  return (
    <Modal
      destroyOnClose
      title={newOptions.title || '确认操作'}
      width={newOptions.width || 520}
      visible={newOptions.visible}
      confirmLoading={newOptions.confirmLoading}
      closable={Boolean(newOptions.closable)}
      maskClosable={Boolean(newOptions.maskClosable)}
      okText={newOptions.okText || '确定'}
      cancelText={newOptions.cancelText || '取消'}
      onOk={newOptions.handleOk}
      onCancel={newOptions.handleCancel}
      afterClose={newOptions.afterClose}
      footer={newOptions.footer}
    >
      <div>
        {newOptions.children ? newOptions.children : newOptions.content || 'Modal的描述内容...'}
      </div>
    </Modal>
  );
}
