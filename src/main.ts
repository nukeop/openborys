import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { run as runDiscord } from "./clients/discord/discord";
import { run as runMatrix } from "./clients/matrix/matrix";
import { run as runTui } from "./clients/tui/tui";

const PLATFORMS = ["matrix", "discord", "tui"] as const;
type Platform = (typeof PLATFORMS)[number];

const runners: Record<Platform, () => void | Promise<void>> = {
  matrix: runMatrix,
  discord: runDiscord,
  tui: runTui,
};

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

await runners[platform]();
