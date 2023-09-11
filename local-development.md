### Steps to make changes in the code base.

1. Clone the app in your local machine using the below git command.
   ```
   git@github.com:aol-everest/aolf-web-v2.git
   ```
2. Open the cloned project folder in your favorite code editor (We recommend VS Code)
3. Create .env file with the below content inside the root folder of the project.

```
NEXT_PUBLIC_SAHAJ_SAMADHI_CTYPE=12415;647244;648468;999649
NEXT_PUBLIC_SILENT_RETREAT_CTYPE=12418;12419;12423;22119;359467;368355;428575;811570
NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE=12371;811569;435714
NEXT_PUBLIC_SRI_SRI_YOGA_CTYPE=814483
NEXT_PUBLIC_TALKABLE_INSTANCE_URL=ddfd
NEXT_PUBLIC_ALLOW_GUEST_LOGIN_CTYPE=811569;12371;999649;12415;8115691;8115692;8115693
```
4. Create .env.test file with the below content inside the root folder of the project.

```
NEXT_PUBLIC_BASIC_MEMBERSHIP=a0Ag000000IhIbaEAF
NEXT_PUBLIC_COGNITO_CLIENT_ID=7c1dm9b10534gmna14ttjpmjh5
NEXT_PUBLIC_COGNITO_DOMAIN=aolf-qa-web.auth.us-east-2.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN=http://localhost:3000/token
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT=http://localhost:3000
NEXT_PUBLIC_COGNITO_REGION=us-east-2
NEXT_PUBLIC_COGNITO_USERPOOL=us-east-2_cJRZyuMaS
NEXT_PUBLIC_DIGITAL_MEMBERSHIP=a0Ag000000IhIbVEAV
NEXT_PUBLIC_FREE_MEMBERSHIP=a0Ag000000IhIbQEAV
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=AIzaSyCrpd52THydLQPH8eFPAo6myRAOW4LsilI
NEXT_PUBLIC_GTM_ID=GTM-5DX26N
NEXT_PUBLIC_JOURNEY_PLUS=a0Ag000000L7UC1EAN
NEXT_PUBLIC_JOURNEY_PREMIUM=a0Ag000000IhIbLEAV
NEXT_PUBLIC_MEDITATE_FOLDER_ID=6lLXgJ5piLurBsl6XJkMfb
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb
NEXT_PUBLIC_SERVER_URL=https://aol-api-qa.herokuapp.com/api/
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_JYrpzw79uH27GTBoUBHm5kIt
NEXT_PUBLIC_WISDOM_FOLDER_ID=150LfaXJ1xmaN3c0sRdVGB
SENTRY_AUTH_TOKEN=b189999a330d495e96a38b375d50bca76d261577149c4a3eafe9731135e2e63a
SENTRY_DSN=https://f8deb8a1ba3e4cf29c51097b7dcf0e21@sentry.io/1485329
SENTRY_RELEASE=qa
NEXT_PUBLIC_GTM_ID=GTM-test
NEXT_PUBLIC_BUILDER_API_KEY=e03c0a8706fb49b2a379e33c2f3e28a6
NEXT_PUBLIC_AMPLIFY_COOKIE_DOMAIN=localhost
NEXT_PUBLIC_ORGANIZATION_NAME=AOL
NEXT_PUBLIC_INSTITUTIONAL_CTYPE=1007138
NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID=865-58W-ZK6Z
``` 

5. Open the terminal or gitbash in the project folder path.
6. Change the current working branch to qa using the below git command.

```
git checkout qa
```

![](RackMultipart20230911-1-l2k3v1_html_2bcd9406108196e.png)

7. If the yarn is not installed globally install yarn using the below command otherwise you can skip this step.

```
npm install -g yarn
```

![](RackMultipart20230911-1-l2k3v1_html_bb52ce62a457f167.png)

8. Install project dependency locally using the below command.

```
yarn install
```

![](RackMultipart20230911-1-l2k3v1_html_f0d9faff961ed4ed.png)

9. Do the needful code changes in the codebase using the code editor
10. Run the local development server to test changes by running this command

```
yarn develop:qa
```
![](RackMultipart20230911-1-l2k3v1_html_de0b7f256f83bc1d.png)

11. If changes look good in the local test then stop the local development server using the cmd+c key and add changes to the git qa branch using the below commands

```
git add .
yarn commit
```
![](RackMultipart20230911-1-l2k3v1_html_2f571de52be022ad.png)

12. This will ask you some questions about your changes before running the LINT fix.
