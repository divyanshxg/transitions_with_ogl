# Counter for processed images
count=0

# Create a directory for resized images if it doesn't exist
mkdir -p resized

# Loop through image files (jpg, png, jpeg, etc.)
for img in *.{jpg,jpeg,png,gif,bmp}; do
    # Check if file exists (in case no images match the pattern)
    if [[ -f "$img" ]]; then
        # Get original filename without extension
        filename=$(basename "$img" | cut -d. -f1)
        # Get extension
        ext="${img##*.}"
        
        ((count++))
        convert "$img" -resize 30% "resized/${count}.$ext"
        
        # Increment counter
        echo "Processed: $img -> resized/${filename}.$ext"
        
    fi
done

echo "Total images processed: $count"
