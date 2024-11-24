import { ensureDir } from "@std/fs";
import { join, parse, SEPARATOR } from "@std/path";
import { Config } from "../types.ts";

/**
 * Copy a directory and its contents to another directory.
 *
 * @param fromDir {string} The source directory.
 * @param toDir {string} The destination directory.
 */
export async function copyFiles(fromDir: string, toDir: string): Promise<void> {
  const templates = Deno.readDir(fromDir);

  console.log("Ensuring directory", `${Deno.cwd()}/${toDir}`);
  await ensureDir(`${Deno.cwd()}/${toDir}`);

  for await (const template of templates) {
    console.log({ template });
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

export async function copyTemplate(
  text: string | Function,
  name: string,
  directory: string,
  config: Config,
): Promise<void> {
  let dir = join(Deno.cwd(), directory);
  if (name.includes(SEPARATOR)) {
    const parsedPath = parse(name);
    name = parsedPath.base;
    dir = join(dir, parsedPath.dir);
  }

  await ensureDir(dir);
  console.log(`Writing template to ${dir}/${name}`);
  const textContent = typeof text === "function" ? text(config) : text;
  return Deno.writeTextFile(join(dir, name), textContent);
}