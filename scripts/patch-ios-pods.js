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
  console.log('📄 Original Podfile length:', podfileContent.length);
  
  // Ensure minimum iOS deployment target
  if (!podfileContent.includes("platform :ios, '12.0'") && !podfileContent.includes("platform :ios, '13.0'")) {
    // Replace any existing platform declaration or add at the top
    if (podfileContent.includes('platform :ios,')) {
      podfileContent = podfileContent.replace(/platform :ios, '[^']*'/, "platform :ios, '12.0'");
      console.log('✅ Updated iOS platform to 12.0');
    } else {
      // Add platform declaration at the beginning
      podfileContent = "platform :ios, '12.0'\n\n" + podfileContent;
      console.log('✅ Added iOS platform 12.0');
    }
  } else {
    console.log('✅ iOS platform already set correctly');
  }

  // Check if post_install already exists
  if (podfileContent.includes('post_install do |installer|')) {
    console.log('⚠️  post_install hook already exists - skipping to avoid conflicts');
    console.log('ℹ️  Will patch Pods project directly after pod install instead');
    fs.writeFileSync(PODFILE_PATH, podfileContent, 'utf8');
    return true;
  }

  // Only add post_install if it doesn't exist
  // Simply append at the end - don't try to be smart about placement
  const postInstallHook = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
      config.build_settings['SWIFT_VERSION'] = '5.0'
      if config.name == 'Debug'
        config.build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-Onone'
      end
    end
  end
end
`;

  podfileContent = podfileContent.trimEnd() + '\n' + postInstallHook;
  console.log('✅ Added post_install hook at end of file');

  fs.writeFileSync(PODFILE_PATH, podfileContent, 'utf8');
  console.log('✅ Podfile written successfully');
  console.log('📄 New Podfile length:', podfileContent.length);
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