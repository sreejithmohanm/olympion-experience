const workforceOS = require('@olympion/workforce-os-sdk');

function createExperienceSdk(config = {}) {
  return {
    ...workforceOS,
    config: {
      environment: config.environment ?? 'production',
      ...config
    }
  };
}

module.exports = {
  ...workforceOS,
  createExperienceSdk
};
