import * as React from 'react';

export interface ConfirmOptions<T> {
  title?: T;
  content?: T;
  iconType?: T;
  maskClosable?: boolean;
  okType?: T;
  okText?: T;
  cancelText?: T;
  onOk?: any;
  onCancel?: any;
}

export interface ModalOptions<T, U> {
  title?: T;
  content?: T;
  width?: T | number;
  visible?: U;
  confirmLoading?: U;
  closable?: U;
  maskClosable?: U;
  okText?: T;
  cancelText?: T;
  handleOk?: () => void;
  handleCancel?: () => void;
  afterClose?: any;
  footer?: React.ReactNode[];
  children?: React.ReactChildren;
}
