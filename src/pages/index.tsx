import React, { useEffect, useState } from "react";
import { Button } from 'antd';
import styles from './index.less';


const ipcRenderer = window.ipcRenderer;

export default () => {
  const [checkText, setCheckText] = useState<string>('检查更新');
  const [processText, setProcessText] = useState<string>('正在检查');
  const [message, setMessage] = useState<string>('');
  const [percent, setPercent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const bind = () => {
    ipcRenderer.on('check-for-update', (event: any, message: string) => {
      setMessage(message);
      if (message === '检查更新出错, 请联系开发人员' || message === '现在使用的就是最新版本，不用更新') {
        setLoading(false);
      }
      if (message === '最新版本已下载，点击安装进行更新') {
        setCheckText('安装');
        setLoading(false);
        setPercent(100);
      }
    });
    ipcRenderer.on('update-down-success', (event: any, message: { version: string; }) => {
      alert('New ' + message.version);
    });
    ipcRenderer.on('download-progress', (event: any, message: { percent: string; }) => {
      setPercent(parseInt(message.percent));
      if (parseInt(message.percent) === 100) {
        setCheckText('安装');
        setLoading(false);
      }
    });

    window.onbeforeunload = () => {
      if (percent > 0 && percent !== 100) {
        return false;
      }
    };
  }


  let checkUpdate = () => {
    if (percent === 100) {
      ipcRenderer.send('system', 'update');
    } else {
      ipcRenderer.send('system', 'check-for-update', 'http://localhost:3000/')
    }
  }

  useEffect(() => {
    bind();
  }, [])

  return (
    <div>
      <h1 className={styles.title}>Page index</h1>
      <p>{message}</p>
      <Button
        onClick={checkUpdate}
        disabled={percent > 0 && percent !== 100}>
        {
          loading ? <span>{processText}</span> : <span>{checkText}</span>
        }
      </Button>
    </div>
  );
}
