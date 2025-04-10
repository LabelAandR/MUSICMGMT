from PIL import Image
import os

def resize_image(input_path, output_path, max_size=200):  
    with Image.open(input_path) as img:
        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1])
            img = background

        # Calculate new dimensions while maintaining aspect ratio
        ratio = min(max_size/max(img.size[0], img.size[1]), 1.0)
        new_size = tuple([int(x*ratio) for x in img.size])
        
        # Resize and save with very low quality
        img_resized = img.resize(new_size, Image.Resampling.LANCZOS)
        img_resized.save(output_path, 'JPEG', optimize=True, quality=30)  

def main():
    image_dir = 'images'
    output_dir = 'images_optimized'
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    else:
        # Clean up old files
        for file in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, file))
    
    # Process each image
    for filename in os.listdir(image_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            input_path = os.path.join(image_dir, filename)
            output_path = os.path.join(output_dir, os.path.splitext(filename)[0] + '.jpg')  
            print(f"Resizing {filename}...")
            resize_image(input_path, output_path)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            reduction = (1 - new_size/original_size) * 100
            
            print(f"Reduced from {original_size/1024:.1f}KB to {new_size/1024:.1f}KB ({reduction:.1f}% smaller)")

if __name__ == '__main__':
    main()
