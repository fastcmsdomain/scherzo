# Goal: Create a Franklin block named "galleria-zdjec" with the following functionality and improvements

## Initial State:
- Display an image gallery with max-width of 900px
- Display a list of image thumbnails within the image gallery
- Display 4 images in a row
- Multiple rows can be added
- Image size must be a square, 250px x 250px
- Each image thumbnail with rounded corners of 25px
- When hovering over the image thumbnail, the image fades 20% to indicate the hover state
- Each image is a clickable link; when clicked, the main image pop-up opens
- The pop-up box containing the main image displays on the screen taking the original size of the image, or if too big, the image should fit into the screen
- The pop-up box has rounded corners of 25px
- The pop-up with image must have a close "X" icon to be able to close the pop-up
- User can close the pop-up by clicking outside of the box as well
- This block must be fully responsive
- On mobile (<600px) the image thumbnails are listed vertically
- On tablet (600px-1200px) the image thumbnails are listed 2 in a row
- When hovering over the image thumbnail, the cursor needs to change to a pointer
- Maximum number of images on the page is 16 images
- If the list of images exceeds 16, introduce lazy loading functionality

## Animation 
Introduce smooth animation when image is clicked and modal pop-up opens

## Document-based authoring
- Create a table called "galleria zdjec" with images in each cell below the heading

## Accessibility
- The block must be compatible with WCAG 2.2 AA
- Ensure all keyboard controls are fully functional
- Add aria labels to the icon for screen readers

## Error handling
- If no image is in a cell, ignore the cell but display a message "brak obrazka"

Tasks 
Create a:
Css
Javascript 
Example.md file to present the table that can be embedded to the google doc 
This is how the block is created.
Readme.md file to describer functionality and improvements
