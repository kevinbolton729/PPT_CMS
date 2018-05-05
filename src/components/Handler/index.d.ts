import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IProps {
  dispatch?: Dispatch;
  loading?: boolean;
  filterData?: any;
  resetData?: any;
  form?: any;
}
export interface IStates {}
