import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IProps {
  dispatch?: Dispatch;
  lists?: { [propName: string]: any };
  loading?: boolean;
}
export interface IStates {}
