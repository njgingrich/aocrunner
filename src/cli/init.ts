// @ts-types="npm:@types/prompts@2.4.9"
import prompts from "prompts";
import { exists } from "@std/fs";

import { TEMPLATE_MAP } from "../../templates/index.ts";
import { InitConfig } from "../types.ts";
import { getYearOptions } from "../util/dates.ts";
import { copyTemplate } from "../util/files.ts";

function promptYear() {
  return {
    type: "select",
    name: "year",
    message: "Choose year",
    choices: getYearOptions(),
    initial: 0,
  } as const;
}

function promptDirectory() {
  return {
    type: "text",
    name: "directory",
    message: "Enter directory name",
    validate: (value: string) => {
      if (!value) {
        return "Directory name cannot be empty";
      }

      return true;
    },
    initial: (prev: string) => prev,
  } as const;
}

async function createProjectDirectory(directory: string) {
  const alreadyExists = await exists(directory);
  if (alreadyExists) {
    throw new Error(`Directory ${directory} already exists`);
  }

  await Deno.mkdir(directory);
}

async function copyTemplates(directory: string, config: InitConfig) {
  for (let [name, template] of Object.entries(TEMPLATE_MAP)) {
    console.log(`Copying template ${name}`);
    await copyTemplate(template, name, directory, config);
  }
}

async function installPackages(directory: string) {
  console.log(`Running \`deno install\` in ${Deno.cwd()}/${directory}`);
  const process = new Deno.Command(Deno.execPath(), {
    args: ["install"],
    cwd: `${Deno.cwd()}/${directory}`,
  });

  const out = await process.output();
  const stdout = new TextDecoder().decode(out.stdout);
  const stderr = new TextDecoder().decode(out.stderr);
  console.log(stdout);
  console.log(stderr);
  if (!out.success) {
    throw new Error(`Failed to install packages`);
  }
}

export async function init(): Promise<number> {
  console.log("Initializing new project...");

  const config: InitConfig = await prompts([promptYear(), promptDirectory()]);

  try {
    console.log(`Initializing project at ${Deno.cwd()}/${config.directory}`);
    await createProjectDirectory(config.directory);
    await copyTemplates(config.directory, config);
    await installPackages(config.directory);

    console.log("Project initialized successfully!");
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }

  return 0;
}
