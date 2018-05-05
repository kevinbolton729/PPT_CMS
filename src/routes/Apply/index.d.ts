import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IProps {
  dispatch: Dispatch;
  loading: boolean;
  originalData: any[];
  data: any[];
}
export interface IStates {}
