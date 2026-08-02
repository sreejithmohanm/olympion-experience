export * from '@olympion/workforce-os-sdk';

export type ExperienceSdkConfig = {
  environment?: string;
  [key: string]: unknown;
};

export declare function createExperienceSdk(config?: ExperienceSdkConfig): typeof import('@olympion/workforce-os-sdk') & {
  config: ExperienceSdkConfig;
};
