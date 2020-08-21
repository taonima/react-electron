import { defineConfig } from 'umi';
import { IConfigFromPlugins } from "@@/core/pluginConfig";
import { IConfig } from "@umijs/types";

const env = process.env.NODE_ENV;

let config: IConfigFromPlugins | IConfig = {
  nodeModulesTransform: {
    type: 'none',
  },
}

if (env === 'production') {
  config = {
    publicPath: './',
    history: { type: 'hash' },
    ...config
  }
}

export default defineConfig(config);
