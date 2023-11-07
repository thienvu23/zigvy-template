import fs from "fs-extra";
import prompts from "prompts";
import {
  __dirname,
  checkPackageIsInstalled,
  execaWorkingDirectory,
  targetDirectory,
} from "./general.mjs";
import path from "path";

const envName = ".env";

const handleAppConfig = async (appName) => {
  const { packageName } = await prompts({
    type: "text",
    name: "packageName",
    message: "What is your package name?",
    initial: `com.${appName.toLowerCase()}`,
  });
  const appConfigJsonPath = path.resolve(
    targetDirectory(appName),
    "app.config.ts"
  );

  let appConfigTs = await fs.readFile(appConfigJsonPath, "utf8");
  // set package name
  appConfigTs = appConfigTs.replace("{{packageName}}", packageName);

  await fs.writeFile(appConfigJsonPath, appConfigTs);
};

const setupSentry = async (appName) => {
  const cwd = targetDirectory(appName);
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
  const envPath = path.resolve(targetDirectory(appName), envName);

  const env = (await fs.readFile(envPath, "utf8"))
    .replace("SENTRY_AUTH_TOKEN=", `SENTRY_AUTH_TOKEN=${authToken}`)
    .replace("SENTRY_DSN=", `SENTRY_DSN=${dns}`)
    .replace("SENTRY_ORG=", `SENTRY_ORG=${org}`)
    .replace("SENTRY_PROJECT=", `SENTRY_PROJECT=${project}`);

  await fs.writeFile(envPath, env, "utf8");

  console.log("✅ Setting up SENTRY Done");
};

export const setupEAS = async (cwd) => {
  console.log("- Setting up EAS ...");

  // Remove app-config json for eas config because it will effect to flow. Because the currently can not handle error of inherit cmd of eas cli.
  const appConfigJsonPath = path.resolve(
    targetDirectory(appName),
    "app.config.ts"
  );
  let configTsJson = await fs.readFile(appConfigJsonPath, "utf8");
  await fs.remove(appConfigJsonPath);

  // Handle eas flow
  try {
    const easCliInstalled = await checkPackageIsInstalled({
      packageName: "eas-cli",
      isGlobal: true,
    });
    if (!easCliInstalled)
      await execaWorkingDirectory("npm", ["install", "-g", "eas-cli"], {
        cwd,
      });

    await execaWorkingDirectory("eas", ["account:view"], {
      cwd,
    }).catch((e) => {
      console.log("❌ [ERROR]: EAS account:view", e.message);
      return execaWorkingDirectory("eas", ["login"], {
        cwd,
      });
    });

    await execaWorkingDirectory("eas", ["init"], {
      cwd,
    });
    // Config for expo-updates
    await execaWorkingDirectory("eas", ["update:configure"], {
      cwd,
    });
    // Config for eas.json
    await execaWorkingDirectory("eas", ["build:configure"], {
      cwd,
    });
    console.log("✅ Setting up EAS Done");
  } catch (e) {
    console.error(
      "❌ [ERROR]: Setup EAS failure. You can setup this later -- using zigvy -eas"
    );
  } finally {
    // Re write after done setup EAS
    await fs.writeFile(appConfigJsonPath, configTsJson, "utf8");
  }
};

export const prepareEnvFile = async (cwd) => {
  const envPath = path.resolve(cwd, envName);
  const distEnvPath = path.resolve(cwd, ".dist.env");
  const gitignorePath = path.resolve(cwd, ".gitignore");

  await fs.copyFile(distEnvPath, envPath);

  let gitignoreContent = await fs.readFile(gitignorePath, "utf8");
  if (!gitignoreContent.includes(".env*")) {
    gitignoreContent = gitignoreContent + "\n.env*";
    await fs.writeFile(gitignorePath, gitignoreContent, "utf8");
  }
};

export async function createExpoApp({ appName, appServiceType }) {
  try {
    console.log("🧻 INIT PROJECT WITH EXPO");
    await execaWorkingDirectory("yarn", [
      "create",
      "expo-app",
      appName,
      "-t",
      "zigvy-expo-template",
    ]).catch((e) => {
      console.log("❌ [ERROR]: create expo-app", e.message);
    });

    const cwd = targetDirectory(appName);
    await setupEAS(cwd);

    await handleAppConfig(appName);

    await prepareEnvFile(cwd).catch(() => {
      console.error(
        "❌ [ERROR]: Setup Env file failure. You can setup this later -- using zigvy-cli -env"
      );
    });

    await setupSentry(appName);
  } catch (e) {
    console.error("❌ [ERROR]: ", e.stderr || e);
    process.exit(1);
  }
}
