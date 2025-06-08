// Test file to diagnose image loading issues
// Run this to test if images are loading properly

const testImages = [
  'https://via.placeholder.com/400x200/0066cc/ffffff?text=Test+Image+1',
  'https://picsum.photos/400/200?random=1',
  'https://picsum.photos/400/200?random=2',
  '/photos/ncaaf.png',
  'https://example.com/broken-image.jpg' // This should fail
];

testImages.forEach((imageUrl, index) => {
  const img = new Image();
  
  img.onload = function() {
    console.log(`✅ Image ${index + 1} loaded successfully: ${imageUrl}`);
  };
  
  img.onerror = function() {
    console.log(`❌ Image ${index + 1} failed to load: ${imageUrl}`);
  };
  
  img.src = imageUrl;
});

console.log('Testing image loading...');
