import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IBrandProps {
  dispatch: Dispatch;
  loading: boolean;
  uploading: string | boolean;
  confirmLoading: boolean;
  data: any[];
  originalData: any[];
  form: any;
  uploadImage: any;
}
export interface IBrandStates {
  visible: boolean;
}

export interface IShopProps {
  dispatch: Dispatch;
  loading: boolean;
  uploading: string | boolean;
  confirmLoading: boolean;
  data: any[];
  originalData: any[];
  form: any;
  uploadImage: any;
}
export interface IShopStates {
  visible: boolean;
}
