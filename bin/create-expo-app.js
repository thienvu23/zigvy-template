import fs from "fs-extra";
import prompts from "prompts";
import { execaWorkingDirectory, targetDirectory } from "./general";
import path from "path";

const envPath = path.resolve(targetDirectory, ".env");
const appConfigJsonPath = path.resolve(targetDirectory, "app.config.ts");

const setupSentry = async () => {
  console.log("- Setting up Sentry ...");
  console.log(
    "Please follow this step",
    "https://docs.expo.dev/guides/using-sentry/#sign-up-for-a-sentry-account-and-create-a-project"
  );
  const { authToken, dns, org, project } = await prompts([
    {
      type: "text",
      name: "authToken",
      message: "AUTH TOKEN: ",
    },
    {
      type: "text",
      name: "dns",
      message: "DNS: ",
    },
    {
      type: "text",
      name: "org",
      message: "ORG: ",
    },
    {
      type: "text",
      name: "project",
      message: "PROJECT: ",
    },
  ]);

  const env = (await fs.readFile(envPath, "utf8"))
    .replace("SENTRY_AUTH_TOKEN=", `SENTRY_AUTH_TOKEN=${authToken}`)
    .replace("SENTRY_DSN=", `SENTRY_DSN=${dns}`)
    .replace("SENTRY_ORG=", `SENTRY_ORG=${org}`)
    .replace("SENTRY_PROJECT=", `SENTRY_PROJECT=${project}`);

  await fs.writeFile(envPath, env, "utf8");

  console.log("✅ Setting up EAS Done");
};

export const setupEAS = async () => {
  console.log("- Setting up EAS ...");
  await execaWorkingDirectory("npm", ["install", "--global", "eas-cli"]);

  const { value } = await prompts({
    type: "confirm",
    name: "value",
    message: "Do you have logged in a expo account on this device?",
    initial: true,
    hint: "yes",
  });
  if (value) await execaWorkingDirectory("eas", ["login"]);

  await execaWorkingDirectory("eas", ["eas init"]).catch((e) => {
    console.log("");
  });

  console.log("✅ Setting up EAS Done");
};

const prepareEnvFile = async () => {
  await fs.copyFile(path.resolve(targetDirectory, ".dist.env"), envPath);
};

const handleAppConfig = async (appName) => {
  const { packageName } = await prompts({
    type: "text",
    name: "packageName",
    message: "What is your package name?",
    initial: `com.${appName.toLowerCase()}`,
  });

  let appConfigTs = await fs.readFile(appConfigJsonPath, "utf8");

  // set package name
  appConfigTs = appConfigTs.replace("{{packageName}}", packageName);

  await fs.writeFile(appConfigJsonPath, appConfigTs);
};

export async function createExpoApp({ appName }) {
  try {
    console.log("🧻 INIT PROJECT WITH EXPO");

    await execaWorkingDirectory("yarn", [
      "create",
      "expo-app",
      appName,
      "-t",
      "zigvy-expo-template",
    ]);

    await handleAppConfig(appName);

    await prepareEnvFile(appName);

    await setupEAS();

    await setupSentry();
  } catch (e) {
    console.error(e.stderr || e);
    process.exit(1);
  }
}
