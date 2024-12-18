import * as log from "@std/log";
import { ensureDir } from "@std/fs";
import { dirname, join, parse, SEPARATOR } from "@std/path";
import type { InitConfig } from "../types.ts";

/**
 * Copy a directory and its contents to another directory.
 *
 * @param fromDir {string} The source directory.
 * @param toDir {string} The destination directory.
 */
export async function copyFiles(fromDir: string, toDir: string): Promise<void> {
  const templates = Deno.readDir(fromDir);

  console.log("Ensuring directory", toDir);
  await ensureDir(toDir);

  for await (const template of templates) {
    if (template.isDirectory) {
      console.log("Copying directory", template.name);
      await copyFiles(
        `${fromDir}/${template.name}`,
        `${toDir}/${template.name}`,
      );
    } else {
      const destPath = `${toDir}/${template.name}`;
      const templatePath = `${fromDir}/${template.name}`;
      console.log(`Copying ${template.name} to ${destPath}`);
      await Deno.copyFile(templatePath, destPath);
    }
  }
}

/**
 * Copy a template string or function to an output directory.
 *
 * @param text {string | Function} The text to copy, or a function that takes a config object and returns text.
 * @param name {string} The name of the file to write. Can include path segments.
 * @param directory {string} The directory to write the file to.
 * @param config {Config} The configuration object to pass to the template function.
 */
export async function copyTemplate(
  text: string | ((config: InitConfig) => string),
  name: string,
  directory: string,
  init: InitConfig,
): Promise<void> {
  let dir = join(Deno.cwd(), directory);
  if (name.includes(SEPARATOR)) {
    const parsedPath = parse(name);
    name = parsedPath.base;
    dir = join(dir, parsedPath.dir);
  }

  await ensureDir(dir);
  log.debug(`Writing template to ${dir}/${name}`);
  const textContent = typeof text === "function" ? text(init) : text;
  return Deno.writeTextFile(join(dir, name), textContent);
}

export function getDayDir(day: number): string {
  return join(Deno.cwd(), `day${day.toString().padStart(2, "0")}`);
}

export function getDayPath(day: number, path?: string): string {
  const dayDir = getDayDir(day);

  if (!path) {
    return dayDir;
  } else {
    return join(dayDir, path);
  }
}

export function writeFileForDay(day: number, path: string, text: string): Promise<void> {
  const dayDir = `day${day.toString().padStart(2, "0")}`;
  return Deno.writeTextFile(join(Deno.cwd(), dayDir, path), text);
}

/**
 * This is useful because if we run a module from a day directory we sometimes still
 * want to get the root dir
 */
export function getProjectDir() {
  const cwd = Deno.cwd();
  if (parse(cwd).name.includes("day")) {
    // return the parent directory
    return dirname(cwd);
  }

  return cwd;
}
