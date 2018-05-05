import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IAdverProps {
  dispatch: Dispatch;
  loading: boolean;
  confirmLoading: boolean;
  uploading: any;
  originalData: any[];
  data: any[];
  form: any;
}
export interface IAdverStates {
  visible: boolean;
}

export interface IArticleProps {
  location: any;
  dispatch: Dispatch;
  loading: boolean;
  confirmLoading: boolean;
  uploading: any;
  originalData: any[];
  data: any[];
  sitetypes: any[];
  channeltypes: any[];
  form: any;
  uploadImage: any;
}
export interface IArticleStates {
  visible: boolean;
  filterValue: string;
}

export interface IChannelProps {
  dispatch: Dispatch;
  loading: boolean;
  confirmLoading: boolean;
  uploading: any;
  originalData: any[];
  data: any[];
  form: any;
}
export interface IChannelStates {
  visible: boolean;
}

export interface ISildeProps {
  dispatch: Dispatch;
  loading: boolean;
  confirmLoading: boolean;
  uploading: any;
  originalData: any[];
  data: any[];
  form: any;
}
export interface ISildeStates {
  visible: boolean;
}
