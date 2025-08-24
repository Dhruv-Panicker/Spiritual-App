
const fs = require('fs');
const path = require('path');

// Read bucket ID from .replit file
function getBucketId() {
  try {
    const replitConfigPath = path.join(__dirname, '..', '.replit');
    const configContent = fs.readFileSync(replitConfigPath, 'utf8');
    
    // Extract bucket ID from config
    const bucketIdMatch = configContent.match(/defaultBucketID\s*=\s*"([^"]+)"/);
    
    if (bucketIdMatch) {
      const bucketId = bucketIdMatch[1];
      console.log('Your bucket ID:', bucketId);
      
      // Generate the storage URLs for your images
      console.log('\nYour guru image URLs will be:');
      const imageNames = ['guru-image-1.jpg', 'guru-image-2.jpg', 'guru-image-3.jpg', 'guru-image-4.jpg'];
      
      imageNames.forEach(name => {
        console.log(`https://storage.googleapis.com/${bucketId}/guru-images/${name}`);
      });
      
      return bucketId;
    } else {
      console.log('Bucket ID not found in .replit file');
    }
  } catch (error) {
    console.error('Error reading bucket ID:', error);
  }
}

getBucketId();
