const fs = require('fs');
const path = require('path');

// Fix for expo-constants PhaseScriptExecution error
// Comments out the 'set -eo pipefail' line that causes build failures

const scriptPath = path.join(__dirname, '..', 'node_modules', 'expo-constants', 'scripts', 'get-app-config-ios.sh');

try {
  if (fs.existsSync(scriptPath)) {
    let content = fs.readFileSync(scriptPath, 'utf8');
    
    // Replace 'set -eo pipefail' with '#set -eo pipefail'
    const fixedContent = content.replace(/^set -eo pipefail$/m, '#set -eo pipefail');
    
    if (content !== fixedContent) {
      fs.writeFileSync(scriptPath, fixedContent, 'utf8');
      console.log('✅ Applied expo-constants iOS script fix');
    } else {
      console.log('✅ expo-constants iOS script fix already applied');
    }
  } else {
    console.log('⚠️  expo-constants script not found, skipping fix');
  }
} catch (error) {
  console.log('⚠️  Could not apply expo-constants fix:', error.message);
}