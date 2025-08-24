
const fs = require('fs');
const path = require('path');

// You'll need to install the replit object storage package
const { Client } = require('@replit/object-storage');

async function uploadGuruImages() {
  try {
    // Create client instance
    const client = new Client();

    // List of your guru image files (place these in a 'guru-images' folder)
    const imageFiles = [
      'guru-image-1.jpg',
      'guru-image-2.jpg', 
      'guru-image-3.jpg',
      'guru-image-4.jpg'
    ];

    console.log('Starting guru image uploads...');

    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const localPath = path.join(__dirname, '..', 'guru-images', filename);
      
      // Check if file exists locally
      if (!fs.existsSync(localPath)) {
        console.log(`File not found: ${localPath}`);
        continue;
      }

      // Read file
      const fileBuffer = fs.readFileSync(localPath);
      
      // Upload to object storage
      await client.uploadFromBytes(`guru-images/${filename}`, fileBuffer);
      
      console.log(`✓ Uploaded: ${filename}`);
    }

    console.log('All guru images uploaded successfully!');
    
    // List uploaded files to verify
    const files = await client.list('guru-images/');
    console.log('Uploaded files:', files.map(f => f.name));

  } catch (error) {
    console.error('Error uploading guru images:', error);
  }
}

uploadGuruImages();
