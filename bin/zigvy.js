#!/usr/bin/env node

import { prepareEnvFile, setupEAS } from "./create-expo-app.mjs";
import { __dirname, targetDirectory } from "./general.mjs";
import { Command } from "commander";

const program = new Command();

program
  .name("zigvy")
  .option("-eas --easConfig", "Run eas config with current directory")
  .option("-env --envConfig", "Run config environment file to current directory")
  .action(async function () {
    const options = program.opts();

    if (options.easConfig) {
      await setupEAS(targetDirectory());
    }
    if (options.envConfig) {
      await prepareEnvFile(targetDirectory());
    }
  })
  .parse(process.argv);
