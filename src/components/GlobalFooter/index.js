import React from 'react';
import classNames from 'classnames';
// 样式
import styles from './index.less';

export default ({ className, links, copyright }) => {
  const clsString = classNames(styles.globalFooter, className);
  const copyrightString = classNames(styles.copyright, styles.info_span);
  return (
    <div className={clsString}>
      {links && (
        <div className={styles.links}>
          {links.map(link => (
            <a key={link.key} target={link.blankTarget ? '_blank' : '_self'} href={link.href}>
              {link.title}
            </a>
          ))}
        </div>
      )}
      {copyright && <div className={copyrightString}>{copyright}</div>}
    </div>
  );
};
