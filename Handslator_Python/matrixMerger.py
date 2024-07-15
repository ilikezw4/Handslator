from PIL import Image, ImageDraw, ImageFont
import os

'''
###############################################################################
Merge the generated images of confusion matrices
###############################################################################
'''

# Directory containing confusion matrix images
base_directory = "./Data"

# Create a folder to store the combined image
output_collab_folder = os.path.join(base_directory, "ConfusionMatrix", "Collab")
os.makedirs(output_collab_folder, exist_ok=True)

# Get all image paths in the current folder
image_paths = [os.path.join(base_directory, img) for img in os.listdir(base_directory) if img.lower().endswith('.png')]

# Load all images
images = []
for image_path in image_paths:
    try:
        img = Image.open(image_path)
        images.append(img)
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")

# Resize images to have the same dimensions
if images:
    # Assuming all images have the same dimensions
    width, height = images[0].size

    # Determine the number of rows and columns in the grid
    rows = 2
    columns = 2

    # Create a blank canvas to combine images in a 2x2 grid
    combined_width = width * columns
    combined_height = height * rows
    combined_image = Image.new('RGB', (combined_width, combined_height))

    # Paste images into the canvas
    index = 0
    for row in range(rows):
        for col in range(columns):
            if index < len(images):
                combined_image.paste(images[index], (col * width, row * height))
                index += 1

    # Save the combined image
    output_path = os.path.join(output_collab_folder, "combined_image_2x2.png")
    combined_image.save(output_path)
    print(f"Combined image saved: {output_path}")
else:
    print("No valid image files found.")
