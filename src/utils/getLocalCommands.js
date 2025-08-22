// src/utils/getLocalCommands.js
const fs = require("fs");
const path = require("path");

function getAllFiles(dirPath) {
  let results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const p = path.join(dirPath, entry.name);
    if (entry.isDirectory()) results = results.concat(getAllFiles(p));
    else if (p.endsWith(".js")) results.push(p);
  }
  return results;
}

module.exports = function getLocalCommands(opts = {}) {
  // 🔥 on enlève "ticket" et "ticket-config" de l’exclusion
  const exclude = new Set([...(opts.exclude || [])]);
  const base = path.join(process.cwd(), "src", "commands");
  const files = getAllFiles(base);

  const commands = [];

  for (const file of files) {
    try {
      const cmd = require(file);

      // Cas 1 : SlashCommandBuilder (cmd.data + cmd.execute)
      if (cmd?.data) {
        const apiCmd = {
          ...cmd.data.toJSON(),
          execute: cmd.execute,
          filePath: file,
        };

        if (exclude.has(apiCmd.name)) {
          console.log(`⏭️  Ignoré (exclu): ${apiCmd.name}`);
          continue;
        }

        commands.push(apiCmd);
        continue;
      }

      // Cas 2 : Commandes "classiques" (name, description, callback)
      const name = cmd?.name;
      const description = cmd?.description;

      if (!name || !description) {
        console.warn(`⚠️  Ignoré (name/description manquant): ${file}`);
        continue;
      }

      if (exclude.has(name)) {
        console.log(`⏭️  Ignoré (exclu): ${name}`);
        continue;
      }

      const apiCmd = {
        name,
        description,
        options: Array.isArray(cmd.options) ? cmd.options : [],
        dm_permission: false,
        callback: cmd.callback,
        execute: cmd.execute,
        filePath: file,
      };

      if (
        Array.isArray(cmd.permissionsRequired) &&
        cmd.permissionsRequired.length > 0
      ) {
        const { PermissionFlagsBits } = require("discord.js");
        let bitfield = 0n;
        for (const perm of cmd.permissionsRequired) {
          bitfield |= BigInt(PermissionFlagsBits[perm] ?? perm);
        }
        apiCmd.default_member_permissions = bitfield.toString();
      } else {
        apiCmd.default_member_permissions = null;
      }

      commands.push(apiCmd);
    } catch (e) {
      console.warn(`⚠️  Impossible de charger ${file}:`, e.message);
    }
  }

  return commands;
};
