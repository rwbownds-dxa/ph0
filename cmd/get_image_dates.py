import os
import json
from datetime import datetime
import pytz

def get_image_dates():
    # Define the directory to scan (relative to the script's location)
    img_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'img')
    output_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'imgDates.json')
    
    # Ensure the img directory exists
    if not os.path.exists(img_dir):
        print(f"Directory {img_dir} does not exist")
        return
    
    # List to store file metadata
    image_data = []
    
    # Supported image extensions
    extensions = ('.jpg', '.jpeg', '.gif', '.png','.bmp','.webp')
    
    try:
        # Iterate over files in the img directory
        for filename in os.listdir(img_dir):
            if any(filename.lower().endswith(ext) for ext in extensions):
                file_path = os.path.join(img_dir, filename)
                # Get file stats
                stats = os.stat(file_path)
                # Get modification time and convert to ISO 8601 format
                modified_time = datetime.fromtimestamp(stats.st_mtime, tz=pytz.UTC)
                image_data.append({
                    'filename': filename,
                    'modified': modified_time.isoformat()
                })
        
        # Sort by filename for consistency
        image_data.sort(key=lambda x: x['filename'])
        
        # Write to imgDates.json
        with open(output_file, 'w') as f:
            json.dump(image_data, f, indent=2)
        print(f"Successfully wrote metadata for {len(image_data)} images to {output_file}")
        
    except Exception as e:
        print(f"Error processing files: {e}")

if __name__ == '__main__':
    get_image_dates()