# Volunteer Web Portal

This is a Single Page Application (SPA) using [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/docs/handbook/react.html).  We used [Create React App](https://github.com/facebook/create-react-app) to initially spin up the code; we're using [React Router](https://reactrouter.com/) for internal navigation.

## Design

The design is based on a [Zeplin project](https://app.zeplin.io/project/626073e5dd4cd5aa6427ff40) created by [Bethany Paquette](http://www.bethanypaquette.com/).  The design was implemented using [SASS](https://sass-lang.com/) and the [Material UI](https://mui.com/) library.  

## App State

Our MVP is very simple, but later updates will add multiple user roles and significant features.  For this reason, we're using [Redux](https://redux.js.org/) and the [Redux Toolkit](https://redux-toolkit.js.org/) to organize, store, and update app state.

## Authentication

Coming soon!

## Serverless Back End

Coming soon!

## Getting Started

In the root `client` folder, follow these instructions:

- Run `npm install` to install necessary dependencies.  We recommend the use of Node 16 for this project.  [Learn how to manage Node versions on your development machine.](https://npm.github.io/installation-setup-docs/installing/using-a-node-version-manager.html)
- This application uses [environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/) stored in `.env` files.  These variables are non-secret settings which are environment specific.  For local development, copy the settings from `.env.example` into a `.env.local` file.  React will use settings from `.env.local` as a default if present.
- With packages installed and environment variables in place, spin up a local development server using `npm start`.  Changes to files should be immediately implemented upon save.

## Deployment

Our repo is hosted on [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/); the application is automatically built and deployed using scripts once code is pushed to the `dev` and `main` branches. 

