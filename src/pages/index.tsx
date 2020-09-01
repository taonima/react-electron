import React from "react";
import Updater from '@/components/updater'
import styles from './index.less';




export default () => {

  return (
    <div>
      <h1 className={styles.title}>Page index</h1>
      {
        process.env.NODE_ENV === 'production' && <Updater/>
      }
    </div>
  );
}
