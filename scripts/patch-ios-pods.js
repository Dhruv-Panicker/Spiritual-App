#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PODFILE_PATH = path.join(process.cwd(), 'ios', 'Podfile');
const PODS_PROJECT_PATH = path.join(process.cwd(), 'ios', 'Pods', 'Pods.xcodeproj', 'project.pbxproj');

console.log('🔧 Patching iOS Pod settings for deployment target and Swift version...');

function patchPodfile() {
  if (!fs.existsSync(PODFILE_PATH)) {
    console.log('❌ Podfile not found at:', PODFILE_PATH);
    return false;
  }

  let podfileContent = fs.readFileSync(PODFILE_PATH, 'utf8');
  
  // Ensure minimum iOS deployment target
  if (!podfileContent.includes("platform :ios, '12.0'") && !podfileContent.includes("platform :ios, '13.0'")) {
    // Replace any existing platform declaration or add at the top
    if (podfileContent.includes('platform :ios,')) {
      podfileContent = podfileContent.replace(/platform :ios, '[^']*'/, "platform :ios, '12.0'");
    } else {
      // Add platform declaration at the beginning
      podfileContent = "platform :ios, '12.0'\n\n" + podfileContent;
    }
    console.log('✅ Set iOS platform to 12.0');
  }

  // Add or update post_install hook
  const postInstallHook = `post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Set minimum iOS deployment target
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
      
      # Set Swift version for consistency
      config.build_settings['SWIFT_VERSION'] = '5.0'
      
      # For Debug builds, use -Onone to avoid preview/optimization conflicts
      if config.name == 'Debug'
        config.build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-Onone'
      end
      
      # Silence deployment target warnings
      config.build_settings['CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS'] = 'NO'
    end
  end
end`;

  if (podfileContent.includes('post_install do |installer|')) {
    // Replace existing post_install hook
    const postInstallRegex = /post_install do \|installer\|[\s\S]*?^end/m;
    podfileContent = podfileContent.replace(postInstallRegex, postInstallHook);
    console.log('✅ Updated existing post_install hook');
  } else {
    // Add new post_install hook - ensure proper placement
    // Remove any trailing whitespace and ensure we don't have double 'end' statements
    podfileContent = podfileContent.trim();
    
    // If the file doesn't end with 'end', add it properly
    if (!podfileContent.endsWith('end')) {
      podfileContent = podfileContent + '\n\n' + postInstallHook;
    } else {
      // Insert before the final 'end' statement
      const lastEndIndex = podfileContent.lastIndexOf('\nend');
      if (lastEndIndex > -1) {
        podfileContent = podfileContent.substring(0, lastEndIndex) + '\n\n' + postInstallHook + '\nend';
      } else {
        // Fallback: just append
        podfileContent = podfileContent + '\n\n' + postInstallHook;
      }
    }
    console.log('✅ Added new post_install hook');
  }

  // Validate basic Ruby syntax by counting do/end pairs
  const doCount = (podfileContent.match(/\bdo\b/g) || []).length;
  const endCount = (podfileContent.match(/\bend\b/g) || []).length;
  
  if (doCount !== endCount) {
    console.log(`⚠️  Syntax warning: Found ${doCount} 'do' and ${endCount} 'end' statements`);
    console.log('Attempting to fix...');
    
    // If we have more ends than dos, remove the extra end
    if (endCount > doCount) {
      const extraEnds = endCount - doCount;
      for (let i = 0; i < extraEnds; i++) {
        const lastEndIndex = podfileContent.lastIndexOf('\nend');
        if (lastEndIndex > -1) {
          podfileContent = podfileContent.substring(0, lastEndIndex) + podfileContent.substring(lastEndIndex + 4);
        }
      }
      console.log(`✅ Removed ${extraEnds} extra 'end' statement(s)`);
    }
  }

  fs.writeFileSync(PODFILE_PATH, podfileContent, 'utf8');
  console.log('✅ Podfile written successfully');
  return true;
}

function patchPodsProject() {
  if (!fs.existsSync(PODS_PROJECT_PATH)) {
    console.log('⚠️  Pods project not found, skipping direct project patch');
    return false;
  }

  let projectContent = fs.readFileSync(PODS_PROJECT_PATH, 'utf8');
  
  // Replace deployment target settings in the project file
  projectContent = projectContent.replace(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 12.0;');
  projectContent = projectContent.replace(/SWIFT_VERSION = [^;]+;/g, 'SWIFT_VERSION = 5.0;');
  
  // Add Swift optimization settings for Debug configs
  if (projectContent.includes('name = Debug;')) {
    projectContent = projectContent.replace(
      /(buildSettings = {[^}]*name = Debug[^}]*)/g,
      (match) => {
        if (!match.includes('SWIFT_OPTIMIZATION_LEVEL')) {
          return match.replace(/};$/, '\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "-Onone";\n\t\t\t};');
        }
        return match.replace(/SWIFT_OPTIMIZATION_LEVEL = [^;]+;/, 'SWIFT_OPTIMIZATION_LEVEL = "-Onone";');
      }
    );
  }

  fs.writeFileSync(PODS_PROJECT_PATH, projectContent, 'utf8');
  console.log('✅ Patched Pods project file directly');
  return true;
}

function main() {
  console.log('Starting iOS Pod patch process...');
  
  const podfilePatched = patchPodfile();
  
  if (podfilePatched) {
    console.log('✅ Podfile patched successfully');
  } else {
    console.log('❌ Failed to patch Podfile');
    process.exit(1);
  }
  
  // Also try to patch the Pods project directly (in case it already exists)
  setTimeout(() => {
    if (fs.existsSync(PODS_PROJECT_PATH)) {
      patchPodsProject();
    }
  }, 1000);
  
  console.log('🎉 iOS Pod patching completed!');
}

if (require.main === module) {
  main();
}

module.exports = { patchPodfile, patchPodsProject };