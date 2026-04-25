import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const PLATFORMS = ["matrix", "discord", "tui"] as const;
type Platform = (typeof PLATFORMS)[number];

const argv = await yargs(hideBin(process.argv))
  .option("platform", {
    type: "string",
    choices: PLATFORMS,
    demandOption: true,
    describe: "Which platform to run on",
  })
  .strict()
  .parseAsync();

const platform: Platform = argv.platform;

console.log(`Hello via Bun on ${platform}!`);
