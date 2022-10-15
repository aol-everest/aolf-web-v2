import { CognitoUserPool } from "amazon-cognito-identity-js";
import { orgConfig } from "@org";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
  ClientId: orgConfig.ClientId,
};

export default new CognitoUserPool(poolData);
