<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function getImages($directory) {
    $images = [];
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!is_dir($directory)) {
        return [];
    }
    
    $files = scandir($directory);
    
    foreach ($files as $file) {
        $path = $directory . '/' . $file;
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        if (in_array($ext, $allowed)) {
            $images[] = [
                'name' => $file,
                'path' => '/photos/' . $file
            ];
        }
    }
    
    return $images;
}

// Get the directory of the current script
$scriptDir = __DIR__;

// Look for photos directory in the same directory as the script
$photosDir = $scriptDir . '/photos';

// If not found, try one level up (for development)
if (!is_dir($photosDir)) {
    $photosDir = dirname($scriptDir) . '/public/photos';
}

$images = getImages($photosDir);

// If no images found, return sample images
if (empty($images)) {
    $images = [
        ['path' => 'https://source.unsplash.com/random/800x600?nature,1'],
        ['path' => 'https://source.unsplash.com/random/800x600?mountain,1'],
        ['path' => 'https://source.unsplash.com/random/800x600?ocean,1'],
        ['path' => 'https://source.unsplash.com/random/800x600?forest,1'],
        ['path' => 'https://source.unsplash.com/random/800x600?sunset,1'],
    ];
}

echo json_encode($images);
?>
