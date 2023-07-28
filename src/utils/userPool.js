/* eslint-disable import/no-anonymous-default-export */
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
};

export default new CognitoUserPool(poolData);
