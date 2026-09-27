function loadWorkforceOsSdk() {
  try {
    return {
      sdk: require('@olympion/workforce-os-sdk'),
      loadError: null
    };
  } catch (error) {
    if (
      error &&
      error.code === 'MODULE_NOT_FOUND' &&
      typeof error.message === 'string' &&
      error.message.includes('@olympion/workforce-os-sdk')
    ) {
      return {
        sdk: {},
        loadError: error
      };
    }

    throw error;
  }
}

const { sdk: workforceOS, loadError: workforceOSLoadError } =
  loadWorkforceOsSdk();

function createExperienceSdk(config = {}) {
  if (workforceOSLoadError) {
    throw new Error(
      'The optional dependency "@olympion/workforce-os-sdk" is not available. Install it to use workforce SDK operations.'
    );
  }

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
