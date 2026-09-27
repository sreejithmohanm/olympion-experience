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

function createMissingSdkMethodError(propertyName) {
  return new Error(
    `The optional dependency "@olympion/workforce-os-sdk" is not available. Install it to use workforce SDK operation "${propertyName}".`
  );
}

function createExperienceSdk(config = {}) {
  const sdkConfig = {
    environment: config.environment ?? 'production',
    ...config
  };

  if (workforceOSLoadError) {
    return new Proxy(
      {
        config: sdkConfig
      },
      {
        get(target, propertyName, receiver) {
          if (propertyName in target) {
            return Reflect.get(target, propertyName, receiver);
          }

          throw createMissingSdkMethodError(String(propertyName));
        }
      }
    );
  }

  return {
    ...workforceOS,
    config: sdkConfig
  };
}

module.exports = {
  ...workforceOS,
  createExperienceSdk
};
