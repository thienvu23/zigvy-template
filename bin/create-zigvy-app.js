#!/usr/bin/env node

import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs-extra";
import { Command, Argument } from "commander";
import { execa } from "execa";

const program = new Command();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createExpoApp(appName, forwardedOpts) {
  try {
    console.log("🧻 INIT PROJECT WITH EXPO");

    const targetDirectory = path.resolve(process.cwd(), appName);
    const execaOpts = { stdio: "inherit", cwd: targetDirectory };

    // console.log("Copping template...");
    // await fs.copy(
    //   path.resolve(__dirname, "../zigvy-expo-template"),
    //   path.resolve(targetDirectory)
    // );

    await execa(
      "npx",
      [
        "create-expo-app",
        appName,
        "-t",
        "https://github.com/thienvu23/zigvy-expo-template",
      ],
      { ...execaOpts, cwd: process.cwd() }
    );

    console.log("Installing additional dependencies...");
    // await execa("yarn", ["install"], execaOpts);

    console.log("Setting up project structure...");

    console.log("✅ Done!");
  } catch (e) {
    console.error(e.stderr || e);
    process.exit(1);
  }
}

const handleAppType = (appName, appType) => {
  if (appType === "rn") {
    console.log("INIT PROJECT WITH REACT NATIVE");
  } else if (appType === "expo") {
    createExpoApp(appName, {});
  }
};

program
  .version("1.0.0")
  .name("create-zigvy-app")
  .usage("[options] <app-name>")
  .arguments("<app-name>")
  .addArgument(
    new Argument("<app-type>", "Select app type to init").choices([
      "rn",
      "expo",
    ])
  )
  .action(handleAppType)
  .parse(process.argv);
