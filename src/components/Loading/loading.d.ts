import * as React from 'react';

export interface IProps {
  size?: 'small' | 'default' | 'large';
  style?: React.CSSProperties;
  type?: string;
  center?: boolean;
  children?: React.ReactNode;
}
