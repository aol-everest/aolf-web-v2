import { configure } from './config.js';

export async function throwIfNot2xx(res) {
  if (res.ok) {
    return res;
  }
  const detail = await res.json();
  let message = detail.message;
  if (detail.__type === 'UserLambdaValidationException') {
    const match = detail.message.match(/^.+failed with error (.+)$/);
    if (match) {
      message = match[1];
    }
  }
  const err = new Error(message);
  err.name = detail.__type;
  throw err;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

export function parseJwtPayload(jwt) {
  if (isObject(jwt) && jwt.payload) {
    return jwt.payload;
  }
  const parts = jwt.split('.');
  const payload = parts[1];
  if (!payload) {
    throw new Error('Invalid JWT');
  }
  return JSON.parse(new TextDecoder().decode(bufferFromBase64Url(payload)));
}

/**
 * Schedule a callback once, like setTimeout, but count
 * time spent sleeping also as time spent. This way, if the browser tab
 * where this is happening is activated again after sleeping,
 * the callback is run immediately (more precise: within 1 second)
 */
export function setTimeoutWallClock(cb, ms) {
  const executeAt = Date.now() + ms;
  const i = setInterval(() => {
    if (Date.now() >= executeAt) {
      clearInterval(i);
      cb();
    }
  }, 1000);

  // unref the interval if we can, so that e.g. when running in Node.js
  // this interval would not block program exit:
  if (typeof i.unref === 'function') i.unref();

  return () => clearInterval(i);
}

export function currentBrowserLocationWithoutFragmentIdentifier() {
  const { location } = configure();
  const current = new URL(location.href);
  current.hash = '';
  return current.href;
}

export function removeFragmentIdentifierFromBrowserLocation() {
  const { history } = configure();
  history.pushState('', '', currentBrowserLocationWithoutFragmentIdentifier());
}

export function timeAgo(now, historicDate) {
  if (!historicDate) return;
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
  };
  const secondsElapsed = Math.max(
    (now.valueOf() - historicDate.valueOf()) / 1000,
    0,
  );
  const [unit, range] = Object.entries(ranges).find(([, range]) => {
    return range < secondsElapsed;
  }) ?? ['seconds', 1];
  const delta = secondsElapsed / range;
  return unit === 'seconds' && delta < 10
    ? 'Just now'
    : new Intl.RelativeTimeFormat('en').format(-Math.floor(delta), unit);
}

/**
 * Base64 implementations below as atob and btoa don't work with unicode
 * and aren't available in all JS environments to begin with, e.g. React Native
 */

const _bufferFromBase64 = function (characters, padChar = '') {
  const map = characters
    .split('')
    .reduce(
      (acc, char, index) => Object.assign(acc, { [char.charCodeAt(0)]: index }),
      {},
    );
  return function (base64) {
    const paddingLength = padChar
      ? base64.match(new RegExp(`^.+?(${padChar}?${padChar}?)$`))[1].length
      : 0;
    let first, second, third, fourth;
    return base64.match(/.{1,4}/g).reduce(
      (acc, chunk, index) => {
        first = map[chunk.charCodeAt(0)];
        second = map[chunk.charCodeAt(1)];
        third = map[chunk.charCodeAt(2)];
        fourth = map[chunk.charCodeAt(3)];
        acc[3 * index] = (first << 2) | (second >> 4);
        acc[3 * index + 1] = ((second & 0b1111) << 4) | (third >> 2);
        acc[3 * index + 2] = ((third & 0b11) << 6) | fourth;
        return acc;
      },
      new Uint8Array((base64.length * 3) / 4 - paddingLength),
    );
  };
};

export const bufferFromBase64 = _bufferFromBase64(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  '=',
);
export const bufferFromBase64Url = _bufferFromBase64(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
);

const _bufferToBase64 = function (characters, padChar = '') {
  const map = characters
    .split('')
    .reduce((acc, char, index) => Object.assign(acc, { [index]: char }), {});
  return function (base64) {
    const result = [];
    for (const chunk of chunks(new Uint8Array(base64), 3)) {
      result.push(map[chunk[0] >> 2]);
      result.push(map[((chunk[0] & 0b11) << 4) | (chunk[1] >> 4)]);
      result.push(
        chunk[1] !== undefined
          ? map[((chunk[1] & 0b1111) << 2) | (chunk[2] >> 6)]
          : padChar,
      );
      result.push(chunk[2] !== undefined ? map[chunk[2] & 0b111111] : padChar);
    }
    return result.join('');
  };
};

export const bufferToBase64 = _bufferToBase64(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  '=',
);
export const bufferToBase64Url = _bufferToBase64(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
);

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.subarray(i, i + n);
  }
}
