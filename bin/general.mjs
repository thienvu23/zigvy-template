import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { execa } from "execa";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const nodeBinPath = path.dirname(process.execPath);

// Thêm đường dẫn của node bin vào PATH hiện hành
const customEnv = {
  ...process.env,
  PATH: `${nodeBinPath}:${process.env.PATH}`,
};

export const targetDirectory = (appName) =>
  path.resolve(process.cwd(), appName ?? "");

export const execaWorkingDirectory = (scriptPath, _arguments, _option) => {
  return execa(scriptPath, _arguments, {
    stdio: "inherit",
    env: customEnv,
    ..._option,
  });
};

export const checkPackageIsInstalled = async ({
  packageName,
  isGlobal = false,
}) => {
  const checked = await execa(
    "npm",
    ["list", isGlobal ? "-g" : "", "grep", packageName],
    {}
  );
  return !!checked.stdout;
};
