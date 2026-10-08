import { db } from "./db";

export async function getSettings(keys) {
  const [rows] = await db.execute(
    `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${keys.map(() => '?').join(', ')})`,
    keys
  );
  
  const settings = {};
  for (const row of rows) {
    settings[row.setting_key] = row.setting_value;
  }
  return settings;
}

export async function getSetting(key) {
  const settings = await getSettings([key]);
  return settings[key] || null;
}
