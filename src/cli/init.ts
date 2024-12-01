import { input, select } from "@inquirer/prompts";
import { exists } from "@std/fs";

import { TEMPLATE_MAP } from "../../templates/index.ts";
import type { InitConfig } from "../types.ts";
import { getYearOptions } from "../util/dates.ts";
import { copyTemplate } from "../util/files.ts";
import { aocTitle } from "../util/ascii.ts";
import { getConfig } from "../config.ts";

function promptYear() {
  return select({
    message: "Choose year",
    choices: getYearOptions(),
  });
}

function promptDirectory(year: string) {
  return input({
    message: "Enter directory name",
    validate: (value: string) => {
      if (!value) {
        return "Directory name cannot be empty";
      }

      return true;
    },
    default: year,
  });
}

function initMessage() {
  aocTitle();
  console.log("Initializing new project...");
  console.log("");
}

async function createProjectDirectory(init: InitConfig) {
  const alreadyExists = await exists(init.directory);
  if (alreadyExists) {
    throw new Error(`Directory ${init.directory} already exists`);
  }

  await Deno.mkdir(init.directory);
}

async function copyTemplates(init: InitConfig) {
  for (const [name, template] of Object.entries(TEMPLATE_MAP)) {
    console.log(`Copying template ${name}`);
    await copyTemplate(template, name, init.directory, init);
  }
}

async function installPackages(init: InitConfig) {
  console.log(`Running \`deno install\` in ${Deno.cwd()}/${init.directory}`);
  const process = new Deno.Command(Deno.execPath(), {
    args: ["install"],
    cwd: `${Deno.cwd()}/${init.directory}`,
  });

  const out = await process.output();
  const stdout = new TextDecoder().decode(out.stdout);
  console.log(stdout);
  if (!out.success) {
    const stderr = new TextDecoder().decode(out.stderr);
    console.log("Error:", stderr);
    throw new Error(`Failed to install packages`);
  }
}

async function initConfig(init: InitConfig) {
  console.log("Writing initial project config");
  const config = await getConfig();

  config.write({ year: init.year, days: {} });
}

export async function init(): Promise<number> {
  initMessage();

  const year = await promptYear();
  const directory = await promptDirectory(year);
  const init: InitConfig = { year, directory };

  try {
    console.log(`Initializing project at ${Deno.cwd()}/${init.directory}`);
    await createProjectDirectory(init);
    await copyTemplates(init);
    await installPackages(init);
    await initConfig(init);

    console.log("Project initialized successfully!");
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }

  return 0;
}
