#!/usr/bin/env node

import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs-extra";
import { Command, Argument } from "commander";
import { execa } from "execa";
import prompts from "prompts";
import { createExpoApp } from "./create-expo-app";

const program = new Command();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    { title: "expo", value: 0 },
    { title: "react-native", value: 1 },
  ];
  promptsRun.push({
    type: "select",
    name: "appType",
    message: "Choose a app type:",
    choices: appTypes,
  });

  const { appType, appName = _appName } = await prompts(promptsRun);

  if (appType === 1) {
    console.log("React-native template not support now");
  } else if (appType === 0) {
    await createExpoApp(appName);
  }

  console.log("✅ Done!");
};

program
  .version("1.0.0")
  .name("create-zigvy-app")
  .usage("[options] [app-name]")
  .arguments("[app-name]")
  .action(handleCreateApp)
  .parse(process.argv);
