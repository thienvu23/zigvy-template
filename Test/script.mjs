import { execa } from "execa";
import { EventEmitter } from "events";

(async () => {
  const res = await execa("eas", ["init"], { stdio: "inherit" }).catch((e) => {
    console.log("[ERROR]", JSON.stringify(e));
  });

  console.log("Hi");
})();
