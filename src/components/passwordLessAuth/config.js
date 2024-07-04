let config_ = undefined;
export function configure(config) {
  if (config) {
    config_ = {
      ...config,
      crypto: config.crypto ?? Defaults.crypto,
      storage: config.storage ?? Defaults.storage,
      fetch: config.fetch ?? Defaults.fetch,
      location: config.location ?? Defaults.location,
      history: config.history ?? Defaults.history,
    };
    config_.debug?.('Configuration loaded:', config);
  } else {
    if (!config_) {
      throw new Error('Call configure(config) first');
    }
  }
  return config_;
}

export function configureFromAmplify(amplifyConfig) {
  const { region, userPoolId, userPoolWebClientId } = isAmplifyConfig(
    amplifyConfig,
  )
    ? amplifyConfig.Auth
    : amplifyConfig;
  if (typeof region !== 'string') {
    throw new Error(
      'Invalid Amplify configuration provided: invalid or missing region',
    );
  }
  if (typeof userPoolId !== 'string') {
    throw new Error(
      'Invalid Amplify configuration provided: invalid or missing userPoolId',
    );
  }
  if (typeof userPoolWebClientId !== 'string') {
    throw new Error(
      'Invalid Amplify configuration provided: invalid or missing userPoolWebClientId',
    );
  }
  configure({
    cognitoIdpEndpoint: region,
    userPoolId,
    clientId: userPoolWebClientId,
  });
  return {
    with: (config) => {
      return configure({
        cognitoIdpEndpoint: region,
        userPoolId,
        clientId: userPoolWebClientId,
        ...config,
      });
    },
  };
}

function isAmplifyConfig(c) {
  return !!c && typeof c === 'object' && 'Auth' in c;
}

class MemoryStorage {
  constructor() {
    this.memory = new Map();
  }
  getItem(key) {
    return this.memory.get(key);
  }
  setItem(key, value) {
    this.memory.set(key, value);
  }
  removeItem(key) {
    this.memory.delete(key);
  }
}

export class UndefinedGlobalVariableError extends Error {}

class Defaults {
  static getFailingProxy(expected) {
    const message = `"${expected}" is not available as a global variable in your JavaScript runtime, so you must configure it explicitly with Passwordless.configure()`;
    return new Proxy(
      () => {
        throw new UndefinedGlobalVariableError(message);
      },
      {
        apply: () => {
          throw new UndefinedGlobalVariableError(message);
        },
        get: () => {
          throw new UndefinedGlobalVariableError(message);
        },
      },
    );
  }

  static get storage() {
    if (typeof window !== 'undefined') {
      return window.localStorage || new MemoryStorage();
    }
    return new MemoryStorage();
  }

  static getWithFallback(globalVar, name) {
    if (typeof globalVar !== 'undefined') {
      return globalVar;
    }
    return Defaults.getFailingProxy(name);
  }

  static get crypto() {
    if (typeof window !== 'undefined') {
      return Defaults.getWithFallback(window.crypto, 'crypto');
    }
    return null;
  }

  static get fetch() {
    if (typeof window !== 'undefined') {
      return Defaults.getWithFallback(window.fetch, 'fetch');
    }
    return null;
  }

  static get location() {
    if (typeof window !== 'undefined') {
      return Defaults.getWithFallback(window.location, 'location');
    }
    return null;
  }

  static get history() {
    if (typeof window !== 'undefined') {
      return Defaults.getWithFallback(window.history, 'history');
    }
    return null;
  }
}
