const { cmd } = require("../command");  
const axios = require('axios');  
const fs = require('fs');  
const path = require("path");  
const AdmZip = require("adm-zip");  

cmd({  
  pattern: "update",  
  alias: ["upgrade", "sync"],  
  react: '🆕',  
  desc: "Update the bot to the latest version.",  
  category: "misc",  
  filename: __filename  
}, async (client, message, args, { from, reply, sender, isOwner }) => {  
  if (!isOwner) {  
    return reply("_*THIS COMMAND IS ONLY FOR THE BOT OWNER.*_");  
  }  

  try {  
    await reply("```_*🔍 CHECKING FOR RAZA-INC-MD UPDATES...*_```\n");  
      
    // Get latest commit from GitHub  
    const { data: commitData } = await axios.get("https://api.github.com/repos/LEGEND-RAZA/KHAN-MD/commits/main");  
    const latestCommitHash = commitData.sha;  

    // Get current commit hash  
    let currentHash = 'unknown';  
    try {  
      const packageJson = require('../package.json');  
      currentHash = packageJson.commitHash || 'unknown';  
    } catch (error) {  
      console.error("Error reading package.json:", error);  
    }  

    if (latestCommitHash === currentHash) {  
      return reply("```_*✅ YOUR RAZA-INC-MD BOT IS ALREADY UP-TO-DATE!*_```\n");  
    }  

    await reply("```_*RAZA-INC-MD BOT UPDATING...🚀*_```\n");  
      
    // Download latest code  
    const zipPath = path.join(__dirname, "latest.zip");  
    const { data: zipData } = await axios.get("https://github.com/LEGEND-RAZA/KHAN-MD/archive/main.zip", { responseType: "arraybuffer" });  
    fs.writeFileSync(zipPath, zipData);  

    await reply("```📦 _*EXTRACTING THE LATEST CODE...*_```\n");  
      
    // Extract ZIP file  
    const extractPath = path.join(__dirname, 'latest');  
    const zip = new AdmZip(zipPath);  
    zip.extractAllTo(extractPath, true);  

    await reply("```_*🔄 REPLACING FILES...*_```\n");  
      
    // Copy updated files, skipping config.js and app.json  
    const sourcePath = path.join(extractPath, "KHAN-MD-main");  
    const destinationPath = path.join(__dirname, '..');  
    copyFolderSync(sourcePath, destinationPath);  

    // Cleanup  
    fs.unlinkSync(zipPath);  
    fs.rmSync(extractPath, { recursive: true, force: true });  

    await reply("```_*🔄 RESTARTING THE BOT TO APPLY UPDATES...*_```\n");  
    process.exit(0);  
  } catch (error) {  
    console.error("Update error:", error);  
    reply("_*❌ UPDATE FAILED. PLEASE TRY MANUALLY.*_");  
  }  
});  

// Helper function to copy directories while preserving config.js and app.json  
function copyFolderSync(source, target) {  
  if (!fs.existsSync(target)) {  
    fs.mkdirSync(target, { recursive: true });  
  }  

  const items = fs.readdirSync(source);  
  for (const item of items) {  
    const srcPath = path.join(source, item);  
    const destPath = path.join(target, item);  

    // Skip config.js and app.json  
    if (item === "config.js" || item === "app.json") {  
      console.log(`Skipping ${item} to preserve custom settings.`);  
      continue;  
    }  

    if (fs.lstatSync(srcPath).isDirectory()) {  
      copyFolderSync(srcPath, destPath);  
    } else {  
      fs.copyFileSync(srcPath, destPath);  
    }  
  }  
}
