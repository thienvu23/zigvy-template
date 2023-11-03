import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { execa } from "execa";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const targetDirectory = path.resolve(process.cwd(), appName);
export const execaOpts = { stdio: "inherit", cwd: targetDirectory };

export const execaWorkingDirectory = (scriptPath, _arguments) => {
  return execa(scriptPath, _arguments, execaOpts);
};
