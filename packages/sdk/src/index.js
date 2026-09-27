function loadWorkforceOsSdk() {
  try {
    return require('@olympion/workforce-os-sdk');
  } catch (error) {
    if (
      error &&
      error.code === 'MODULE_NOT_FOUND' &&
      typeof error.message === 'string' &&
      error.message.includes('@olympion/workforce-os-sdk')
    ) {
      return {};
    }

    throw error;
  }
}

const workforceOS = loadWorkforceOsSdk();

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
