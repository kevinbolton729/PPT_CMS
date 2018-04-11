import 'rc-drawer-menu/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer-menu';
// 常量
import { NOCOLLAPSEDWIDTH } from '@/utils/consts';

import SiderMenu from './SiderMenu';

export default props =>
  (props.isMobile ? (
    <DrawerMenu
      parent={null}
      level={null}
      iconChild={null}
      open={!props.collapsed}
      onMaskClick={() => {
        props.onCollapse(true);
      }}
      width={`${NOCOLLAPSEDWIDTH}px`}
    >
      <SiderMenu {...props} collapsed={props.isMobile ? false : props.collapsed} />
    </DrawerMenu>
  ) : (
    <SiderMenu {...props} />
  ));
