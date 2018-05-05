import * as React from 'react';
import { IAction } from '../../global';

type Dispatch = IAction['dispatch'];

export interface IProps {
  dispatch: Dispatch;
  login: any;
  submitting: boolean;
}
export interface IStates {
  type: string;
  autoLogin: boolean;
  mode: {
    isRegister: boolean;
    isMobile: boolean;
    isOther: boolean;
    isForget: boolean;
    isAuto: boolean;
  };
}
