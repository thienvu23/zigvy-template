#!/usr/bin/env node

import { Command } from "commander";
import prompts from "prompts";
import { createExpoApp } from "./create-expo-app.mjs";

const program = new Command();

export const APP_TYPE = {
  reactNative: 1,
  expo: 0,
};

export const APP_SERVICE_TYPE = {
  reactQuery: 1,
  graphql: 0,
};

const handleCreateApp = async (_appName) => {
  const promptsRun = [];

  // Missing arg ask by prompts
  if (!_appName) {
    promptsRun.push({
      type: "text",
      name: "appName",
      message: "App name?:",
      validate: (v) => !!v || "App name is require",
    });
  }

  // Pick App Type
  const appTypes = [
    { title: "expo", value: APP_TYPE.expo },
    { title: "react-native", value: APP_TYPE.reactNative },
  ];
  const appServiceTypes = [
    { title: "react-query", value: APP_SERVICE_TYPE.reactQuery },
    { title: "graphql", value: APP_SERVICE_TYPE.graphql },
  ];
  promptsRun.push([
    {
      type: "select",
      name: "appType",
      message: "Choose a app type:",
      choices: appTypes,
    },
    {
      type: "select",
      name: "appServiceType",
      message: "Choose a app service type:",
      choices: appServiceTypes,
    },
  ]);

  const {
    appType,
    appName = _appName,
    appServiceType,
  } = await prompts(promptsRun);

  if (appType === 1) {
    console.log("React-native template not support now");
  } else if (appType === 0) {
    await createExpoApp({ appName, appServiceType });
  }

  console.log("✅ Done!");
};

program
  .name("create-zigvy-app")
  .usage("[options] [app-name]")
  .arguments("[app-name]")
  .action(handleCreateApp)
  .parse(process.argv);
