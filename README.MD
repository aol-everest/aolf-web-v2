# aolf-web

![Heroku](https://heroku-badge.herokuapp.com/?app=aolf-web)
The next.js Web project for the AOLF web application.

## Prerequisites

1. [Visual Studio Code](https://code.visualstudio.com/)
1. [Node Version Manager](https://github.com/creationix/nvm#installation)
1. `nvm install 12.22.0`
1. `nvm alias default 12.22.0`
1. `npm i -g yarn`

## Available Scripts

In the project directory, you can run:

### `yarn develop`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn develop:qa`

Runs the app in the qa mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn develop:prod`

Runs the app in the production mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `yarn start`

Runs the app in the production mode.

### Prettier

This scaffold comes with a `prettier` precommit Git hook. In other words, your JS can be in whatever style you want as you develop. When you stage your commits to git, `prettier` will automatically format your code to an opinionated standard.

## Architecture
