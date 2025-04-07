/**
 * Copyright Amazon.com, Inc. and its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You
 * may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
import { parseJwtPayload } from './util.js';
import { configure } from './config.js';
import { clearAuthCookies } from '@utils';
export async function clearInflightOAuth() {
  const { clientId, storage } = configure();
  const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const inflightOAuth = storage.getItem(`${amplifyKeyPrefix}.inflightOAuth`);
  if (inflightOAuth === 'true') {
    console.log('Clearing stale inflightOAuth...');
    storage.removeItem(`${amplifyKeyPrefix}.inflightOAuth`);
  }
}

export async function storeTokens(tokens) {
  console.log('Storing tokens...');
  await clearAuthCookies();
  const { clientId, storage } = configure();
  const {
    sub,
    email,
    'cognito:username': username,
  } = parseJwtPayload(tokens.idToken);
  const { scope } = parseJwtPayload(tokens.accessToken);
  const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const customKeyPrefix = `Passwordless.${clientId}`;

  const promises = [];
  promises.push(storage.setItem(`${amplifyKeyPrefix}.LastAuthUser`, username));
  promises.push(
    storage.setItem(`${amplifyKeyPrefix}.${username}.idToken`, tokens.idToken),
  );
  promises.push(
    storage.setItem(
      `${amplifyKeyPrefix}.${username}.accessToken`,
      tokens.accessToken,
    ),
  );
  if (tokens.refreshToken) {
    promises.push(
      storage.setItem(
        `${amplifyKeyPrefix}.${username}.refreshToken`,
        tokens.refreshToken,
      ),
    );
  }
  promises.push(
    storage.setItem(
      `${amplifyKeyPrefix}.${username}.userData`,
      JSON.stringify({
        UserAttributes: [
          {
            Name: 'sub',
            Value: sub,
          },
          {
            Name: 'email',
            Value: email,
          },
        ],
        Username: username,
      }),
    ),
  );
  promises.push(
    storage.setItem(`${amplifyKeyPrefix}.${username}.tokenScopesString`, scope),
  );
  if (tokens.expireAt) {
    promises.push(
      storage.setItem(
        `${customKeyPrefix}.${username}.expireAt`,
        tokens.expireAt.toISOString(),
      ),
    );
  }
  await Promise.all(promises.filter((p) => !!p));
}

export async function retrieveTokens() {
  const { clientId, storage } = configure();
  const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const customKeyPrefix = `Passwordless.${clientId}`;
  const username = await storage.getItem(`${amplifyKeyPrefix}.LastAuthUser`);
  if (!username) {
    return;
  }
  const [accessToken, idToken, refreshToken, expireAt] = await Promise.all([
    storage.getItem(`${amplifyKeyPrefix}.${username}.accessToken`),
    storage.getItem(`${amplifyKeyPrefix}.${username}.idToken`),
    storage.getItem(`${amplifyKeyPrefix}.${username}.refreshToken`),
    storage.getItem(`${customKeyPrefix}.${username}.expireAt`),
  ]);
  return {
    idToken: idToken ?? undefined,
    accessToken: accessToken ?? undefined,
    refreshToken: refreshToken ?? undefined,
    expireAt: expireAt ? new Date(expireAt) : undefined,
    username,
  };
}

export async function clearStorage() {
  const { clientId, storage } = configure();
  const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const customKeyPrefix = `Passwordless.${clientId}`;
  const username = await storage.getItem(`${amplifyKeyPrefix}.LastAuthUser`);

  if (!username) {
    return;
  }

  const keysToRemove = [
    `${amplifyKeyPrefix}.LastAuthUser`,
    `${amplifyKeyPrefix}.${username}.idToken`,
    `${amplifyKeyPrefix}.${username}.accessToken`,
    `${amplifyKeyPrefix}.${username}.refreshToken`,
    `${amplifyKeyPrefix}.${username}.userData`,
    `${amplifyKeyPrefix}.${username}.tokenScopesString`,
    `${customKeyPrefix}.${username}.expireAt`,
  ];

  keysToRemove.forEach((key) => storage.removeItem(key));

  storage.clear();
}
