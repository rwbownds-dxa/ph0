import React, { useState, useEffect } from "react";
import { saveAs } from 'file-saver';
import './ImageCarousel.css';

// Import all images from the src/img directory
// const images = require.context("./img", false, /\.(jpg|gif)$/).keys().map((path) => require(`./img/${path.replace('./', '')}`));

// Import all images from the src/imgNew directory
let newImages = [];
let imageFileNames = [];

try {
    newImages = require.context("./imgNew", false, /\.(jpg|gif|png)$/).keys().map((path) => require(`./imgNew/${path.replace('./', '')}`));

} catch (error) {
    console.error("Error loading images from imgNew:", error);
}
console.log('newImages: ', newImages);

// Import all images from the src/img directory
const standardImages = require.context("./img", false, /\.(jpg|gif|png)$/).keys().map((path) => require(`./img/${path.replace('./', '')}`));
console.log ('standardImages: ', standardImages);

// Combine the images and assign weights
let images = [...newImages, ...standardImages];

// store the filenames in an array for later use
imageFileNames = images.map((image) => image.split('/').pop());
    console.log('Filenames:', imageFileNames);

// set initial weights to 1
const initialWeights = [...Array(newImages.length).fill(20), ...Array(standardImages.length).fill(1)];

// Import all images from the src/imgSav subdirectories
// use the subdirectory name as a key to this array
// so there is one array for each subdirectory

let savedImages = [];
try {
    savedImages = require.context("./imgSav", true, /\/[^/]+$/).keys().map((path) => path.replace('./', ''));
} catch (error) {
    console.error("Error loading savedImages:", error);
}
console.log('savedImages:', savedImages);


const ImageCarousel = ({ state }) => {

    console.log( 'isMobile:' + state.isMobile )

    // STATE VARIABLES ----------------------------------

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRandomPlay, setIsRandomPlay] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [ imageStack, setImageStack ] = useState([]); // imageStack is an array of image indexes that are saved on a 'o' and pulled on 'p'
    const [stackIndex, setStackIndex] = useState(-1); // Track the current position in the imageStack
    const [ previousImages, setPrevImages ] = useState([]);
    const [ reverseImages, setReverseImages ] = useState([]);
    const [ isDirectionForward, setIsDirectionForward ] = useState(true);
    const [ randomPlayInterval, setRandomPlayInterval ] = useState(6000);
    const [isStackRandomPlay, setIsStackRandomPlay] = useState(false); // Track if stack random play is active
    const [imageWeights, setImageWeights] = useState(initialWeights); // Initialize weights to 1 for each image
    

    // STYLES -------------------------------------

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            overflow: 'auto',
            backgroundColor: '#000',
            position: 'relative',
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',  // Ensures the image covers the entire window while maintaining aspect ratio
        },
        leftArrow: {
          left: '10px',
          top: '50%',
        },
        rightArrow: {
            right: '10px',
            top: '50%',
        },
        leftArrow2: {
            left: '10px',
            top: '65%',
        },
        rightArrow2: {
            right: '10px',
            top: '60%',
        },
        fileName: {
            right: '10px',
            top: '78%',
        },
        imageWeight: {
            right: '10px',
            top: '84%',
        },
        currentIndex: {
            right: '10px',
            top: '90%',
        },
        randomButton: {
            left: '10px',
            top: '78%', 
        },
        weightButton: {
            left: '10px',
            top: '84%', 
        },
        setWeightButton: {
            left: '10px',
            top: '90%', 
        },
        loadSub: {
            left: '10px',
            top: '95%', 
        },
        partialButton: {
            left: '10px',
            top: '25%', 
        },
    };
    
    // MOBILE STYLES
    if ( state.isMobile ) {
        styles.leftArrow.fontSize = '1.5rem';
        styles.leftArrow2.fontSize = '1.7rem';
        styles.rightArrow.fontSize = '1.5rem';
        styles.rightArrow2.fontSize = '1.7rem';
        styles.currentIndex.fontSize = '1rem';
        styles.weightButton.fontSize = '1.5rem';
        styles.randomButton.fontSize = '1.5rem';
        styles.leftArrow.fontSize = '1.5rem';
        styles.fileName.fontSize = '1rem';
        styles.imageWeight.fontSize = '1rem';
        styles.weightButton.fontSize = '1rem';
        styles.setWeightButton.fontSize = '1rem';
        styles.loadSub.fontSize = '1rem';
        styles.leftArrow.top = '10%';
        styles.leftArrow2.top = '50%';
        styles.randomButton.top = '65%';
        styles.setWeightButton.top = '76%';
        styles.weightButton.top = '85%';
        
        styles.rightArrow.top = '10%';
        styles.rightArrow2.top = '50%';
        styles.currentIndex.top = '80%';
        styles.imageWeight.top = '87%';
        styles.fileName.top = '95%';

        
        

    }


    // FUNCTIONS ----------------------------------

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    // GET THE NEXT "RANDOM" IMAGE
    //
    // 1. If there are images in the reverseImages array, pop one and set it as the current image
    // 2. If the reverseImages array is empty, generate a random index until it is different from the current one
    
    const randomImage = () => {
        let randomIndex;
        if (reverseImages.length > 0) {
            randomIndex = reverseImages.pop();
            setCurrentIndex(randomIndex);
            setPrevImages((prevImages) => [...prevImages, randomIndex]);
            return;
        } else { 
            do {
            const totalWeight = imageWeights.reduce((sum, weight) => sum + weight, 0);
            console.log('Total weight:', totalWeight);
            let randomWeight = Math.random() * totalWeight;
            console.log('Random weight:', randomWeight);
            for (let i = 0; i < images.length; i++) {
                randomWeight -= imageWeights[i];
                if (randomWeight <= 0) {
                    randomIndex = i;
                    break;
                }
            }
            console.log('Random index:', randomIndex);
        
            // use a weight index to choose the next image
            // each image in images has a weight, the higher the weight, the higher the chance of being chosen
            // weight is set when user hits the 'w' key and is looking at the image

            // randomIndex = Math.floor(Math.random() * images.length);
        } while (randomIndex === currentIndex);  // Ensure that the new image is different from the current one

      setCurrentIndex(randomIndex);
      setPrevImages((prevImages) => [...prevImages, randomIndex]);
      setIsDirectionForward(true);

      console.log('previous ',previousImages);
      console.log('reverse ', reverseImages);
      console.log(isDirectionForward);
    }
    };

    const gobackImage = () => {
        
        const nrPreviousImages = previousImages.length;
        const imgMinusOne = previousImages[nrPreviousImages-1];
        const imgMinusTwo = previousImages[nrPreviousImages-2];
        const previousImage = previousImages.pop() || 0 ;
        console.log(previousImage);
        let newImage;
        if (isDirectionForward) { newImage = imgMinusTwo || 0; }
        else { newImage = imgMinusTwo || 0; }
        // const newImage = isDirectionForward ? previousImages[previousImages.length-1] : previousImage;
        console.log(newImage);
        
        setCurrentIndex(newImage);
        setReverseImages([...reverseImages, previousImage]);
        setIsDirectionForward(false);

        console.log(previousImages);
        console.log(reverseImages);
        console.log(isDirectionForward);
    };

    const test = () => {

        console.log(previousImages);
        console.log(reverseImages);
        console.log(isDirectionForward);
    };

    const changeZoom = (direction) => {
        if ( direction === '1' ) {
            setZoom(100);
            const img = document.querySelector('#img-container img');
            if (img) {
                img.style.transform = `scale(${1})`;
                img.style.transformOrigin = 'left top';
            }
            return 100;
        }
        // Update the zoom state first
        setZoom((prevZoom) => {
            const newZoom = direction === '+' ? prevZoom + 10 : prevZoom - 10;
            // Apply the new zoom value to the img-container element
            const img = document.querySelector('#img-container img');
            if (img) {
                img.style.transform = `scale(${newZoom / 100})`;
                img.style.transformOrigin = 'left top';
            }
            return newZoom;
        });
    };


    // SAVE PLAYLIST FUNCTION

    const savePlaylist = () => {
        const listName = prompt("Enter a name for the playlist:");
        if (listName === null || listName.trim() === "") {
            alert("Playlist name is required.");
            return;
        }

        const playlist = imageStack.map(index => {
            const fullPath = images[index];
            const fileName = fullPath.split('/').pop();
            const baseName = fileName.split('.')[0];
            const extension = fileName.split('.').pop();
            return `${baseName}.${extension}`;
        });

        localStorage.setItem(listName, JSON.stringify(playlist));
        alert(`Playlist "${listName}" saved successfully.`);
    };


    // LOAD PLAYLIST FUNCTION

    const loadPlaylist = () => {
        const listName = prompt("Enter the name of the playlist to load:");
        if (!listName) {
            alert("Playlist name is required.");
            return;
        }
        const playlist = JSON.parse(localStorage.getItem(listName));
        console.log('Playlist load:', playlist);
        if (playlist) {
            const mappedPlaylist = playlist.map((filename) => {
                // console.log('Filename:', filename);
                const index = images.findIndex((path) => {
                    const fullPath = path.split('/').pop();
                    const baseName = fullPath.split('.')[0];
                    const extension = fullPath.split('.').pop();
                    const fullFileName = `${baseName}.${extension}`;
                    const includesFilename = fullFileName.includes(filename);
                    //console.log('Path:', path, 'Full Filename:', fullFileName, 'Includes Filename:', includesFilename);
                    return includesFilename;
                });
                // console.log('Index:', index);
                return index;
            });
            // prompt user for a weight to assign to itmes in the playlist (default 10)
            const weight = prompt("Enter a weight for the playlist:", "10");
            if (weight === null || weight.trim() === "") { weight = 10; }
            const weightValue = parseInt(weight, 10);
            if (!isNaN(weightValue)) {
                setImageWeights((prevWeights) => {
                    const newWeights = [...prevWeights];
                    mappedPlaylist.forEach((index) => {
                        newWeights[index] = weightValue;
                    });
                    return newWeights;
                });
            } else {
                alert("Invalid weight. Please enter a number.");
            }
            setImageStack(mappedPlaylist);
            setCurrentIndex(mappedPlaylist[0]);
        } else {
            alert("Playlist not found.");
        }
    };


    // SAVE WEIGHTS FUNCTION

    const saveWeights = () => {
        const name = prompt("Enter a name for the weights. start with f- to load from file:");   
            if (name === null || name.trim() === "") {
                alert("Name is required.");
                return; 
            }
            const weights = imageWeights.map((weight, index) => {       
                const fullPath = images[index];
                const fileName = fullPath.split('/').pop();
                const baseName = fileName.split('.')[0];
                const extension = fileName.split('.').pop();
                return { name: `${baseName}.${extension}`, weight };
            });
            // if the name begins with 'f-', save the weights to a file
            if (name.startsWith('f-')) {
                const fileName = name.substring(2);
                const blob = new Blob([JSON.stringify(weights)], { type: 'application/json' }); 
                saveAs(blob, fileName);
            } else {    
                localStorage.setItem(name, JSON.stringify(weights));
            }   
    };


    // LOAD WEIGHTS FUNCTION

    const loadWeights = async ( ) => {
        const name = prompt("Enter the name of the weights to load:", "f-Main");
        if (!name) {
            alert("Name is required.");
            return;
        }
        
        let weightsFromFile;
        
        // if name=1, set all weights to 1
        if (name === '1') {
            setImageWeights(Array(images.length).fill(1));
            return;
        }

        let merge = true
        const mergeResp = prompt("Merge weights? (y/n):", "y");
        if (mergeResp === 'n' || mergeResp === 'N') { merge = false; }       

        // if the name begins with 'f-', load the weights from a file. put the weights in the weights variable
        if (name.startsWith('f-')) {
            const fileName = name.substring(2) + '.json';
            const response = await fetch(fileName);
            console.log('fileName:', fileName);
            console.log('response:', response);

            const data = await response.json();
            weightsFromFile = data;
        
        } else {
        weightsFromFile = JSON.parse(localStorage.getItem(name));
        }
        console.log('Merge:', merge);
        if (weightsFromFile) {
            const newWeights = imageWeights.slice(); // Create a copy of the current weights
            weightsFromFile.forEach((weight) => {
                const index = images.findIndex((path) => {
                    const fullPath = path.split('/').pop();
                    const baseName = fullPath.split('.')[0];
                    const extension = fullPath.split('.').pop();
                    return `${baseName}.${extension}` === weight.name;
                });
                if (index !== -1) {
                    if (index === 1) { 
                        console.log('Index:', index, 'Weight:', weight.weight, 'Current Weight:', imageWeights[index]); }
                        console.log()
                    newWeights[index] = merge ? Math.max(imageWeights[index], weight.weight) : weight.weight;
                }
            });
            setImageWeights(newWeights);
        } else {
            alert("Weights not found.");
        }
    };


    // RANDOM PLAY FUNCTION

    const randomPlay = (ask = false) => {
        if (ask && !isRandomPlay) {
            const intervalInput = prompt("Enter interval time in seconds for random play:", "5");
            const intervalTime = parseInt(intervalInput, 10) > 0 ? parseInt(intervalInput, 10) * 1000 : 5000;
            setRandomPlayInterval(intervalTime);
            setIsRandomPlay(true);
            console.log('Random play activated')
        } else {
            console.log('setting random play to:', !isRandomPlay);
            setIsRandomPlay(prev => !prev);
        }
    };


    // FLATTEN WEIGHTS FUNCTION

    const flattenWeights = () => {
        // for all weights > 1, set them equal to a number given by the user (prompt)
        const weight = prompt("Enter a weight for all images with a weight > 1:", "21");
        if (weight === null || weight.trim() === "") { alert("Weight is required."); return; }
        const weightValue = parseInt(weight, 10);
        if ( isNaN(weightValue) ) { alert("Invalid weight. Please enter a number."); return; }
        
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            newWeights.forEach((w, index) => {
                if (w > 1) {
                    newWeights[index] = weightValue;
                }
            });
            return newWeights;
        });
    };


    // COMPRESS WEIGHTS FUNCTION

    const compressWeights = () => {
        // set maxWeight to the highest weight in the imageWeights array
        const maxWeight = Math.max(...imageWeights);
        // get compression ratio from user. give user the maxWeight as a reference
        const ratio = prompt(`Enter a compression ratio in % (maxWeight = ${maxWeight}):`, "80");
        if (ratio === null || ratio.trim() === "") { alert("Ratio is required."); return; }
        const ratioValue = parseInt(ratio, 10);
        if ( isNaN(ratioValue) ) { alert("Invalid ratio. Please enter a number."); return; }
        // calculate the new weight for each image. only adjust weights > 1 and all weights must be integers (round)
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            newWeights.forEach((w, index) => {
                if (w > 1) {
                    newWeights[index] = Math.round(w * ratioValue / 100);
                }
            });
            return newWeights;
        });
    };


    // INVERT WEIGHTS FUNCTION

    const invertWeights = () => {
        // for all weights > 1, set them equal to one
        // for all weights == 1, set them equal to a number given by the user (prompt)
        const weight = prompt("Enter a weight for all images with a weight = 1:", "21");
        if (weight === null || weight.trim() === "") { alert("Weight is required."); return; }
        
        const weightValue = parseInt(weight, 10);
        if ( isNaN(weightValue) ) { alert("Invalid weight. Please enter a number."); return; }
        
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            newWeights.forEach((w, index) => {
                if (w > 1) {
                    newWeights[index] = 1;
                } else {
                    newWeights[index] = weightValue;
                }
            });
            return newWeights;
        });
    };


    // RANDOMIZE WEIGHTS FUNCTION

    const randomizeWeights = () => {
        // prompt user for a max weight. set all weights to a random number between 1 and maxWeight
        let maxWeight = prompt("Enter a maximum weight:", "100");
        if (maxWeight === null || maxWeight.trim() === "") { alert("Max weight is required."); return; }
        maxWeight = parseInt(maxWeight, 10); 
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            newWeights.forEach((w, index) => {
                newWeights[index] = Math.floor(Math.random() * maxWeight) + 1;
            });
            return newWeights;
        });
    };


    // HIDE BUTTONS FUNCTION
    
    const toggleHideButtons = () => {
        const buttons = document.querySelectorAll('.action-button');
        buttons.forEach((button) => {
            button.style.display = button.style.display === 'none' ? 'block' : 'none';
        });
    };

    // -----------------------------------------------
    //            EVENT HANDLERS FOR KEYS 
    // -----------------------------------------------

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleKeyDown = async (event) => {

        if (event.key === "ArrowRight") {
            nextImage();
        
        } else if (event.key === "ArrowLeft") {
            prevImage();
        
        } else if (event.key === "ArrowUp" ) {
            randomImage();
        
        } else if (event.key === "ArrowDown") {
            gobackImage();

        // random play slideshow
        } else if (event.key === "r") {
            randomPlay();

        // random play from image stack
        } else if (event.key === "t") {
            setIsStackRandomPlay((prev) => !prev);

        // ZOOM in, zoom out, reset zoom
        } else if (event.key === "z") {
            changeZoom('+');
        } else if (event.key === "x") {
            changeZoom('-');
        } else if (event.key === "c") {
            changeZoom('1');

        // change the random play INTERVAL
        } else if (event.key >= '0' && event.key <= '9') {  // change the random play interval
            const interval = event.key === '0' ? 10 : parseInt(event.key, 10);
            setRandomPlayInterval(interval * 1000);
        } else if (event.key === '.') {   // Go to a specific image index
            setRandomPlayInterval(randomPlayInterval / 7 );
        } else if (event.key === ',') {   // Go to a specific image index
            setRandomPlayInterval(randomPlayInterval * 3 );

        // GO TO a specific image index
        } else if (event.key === 'n') {   
            goToIndex();    

        // LOAD from filename
        } else if (event.key === 'l') {
            goToFilename();
            
         // SAVE FILE: current image to the disk
        } else if (event.key === 's') {  
            saveImage(currentIndex);
        
        // IMAGE STACK save and delete
        } else if (event.key === 'o') {   // Place the current image on the stack
            setImageStack((imageStack) => [...imageStack, currentIndex]);
        } else if (event.key === 'p') {   // Pull the current image from the stack
            setImageStack((imageStack) => {
                const index = imageStack.indexOf(currentIndex);
                if (index !== -1) {
                    imageStack.splice(index, 1);
                }
                return [...imageStack];
            });

        // load and save stack to playlist
        } else if (event.key === 'y') {   // Save the playlist
            savePlaylist();
        } else if (event.key === 'u') {   // Load a playlist
            loadPlaylist();

        // next and previous saved image
        } else if (event.key === '[') {   // Go to the previous image in the stack
            setStackIndex((prevIndex) => {
                const newIndex = prevIndex > 0 ? prevIndex - 1 : imageStack.length - 1;
                setCurrentIndex(imageStack[newIndex]);
                return newIndex;
            });
        } else if (event.key === ']') {   // Go to the next image in the stack
            setStackIndex((prevIndex) => {
                const newIndex = (prevIndex + 1) % imageStack.length;
                setCurrentIndex(imageStack[newIndex]);
                return newIndex;
            });

        // SET WEIGHT of the current image
        } else if (event.key === "w") { setWeightForCurrentImage(); 
        } else if (event.key === 'q') {   // increase weight of current image by 20
            setImageWeights((prevWeights) => {
                const newWeights = [...prevWeights];
                newWeights[currentIndex] += 20;
                return newWeights;
            });
        } else if (event.key === 'e') {   // decrease weight of current image by 20   
            setImageWeights((prevWeights) => {
                const newWeights = [...prevWeights];
                newWeights[currentIndex] -= 20;
                return newWeights;
            }
        );

        // SAVE WEIGHTS
        } else if (event.key === 'a') {
            saveWeights();

        // LOAD WEIGHTS        
        } else if (event.key === 'd') {    
            loadWeights();
        }

        // FLATTEN WEIGHTS
        else if (event.key === 'f') {
            flattenWeights();
        }

        // COMPRESS WEIGHTS
        else if (event.key === 'g') {
            compressWeights();
        }

        // INVERT WEIGHTS
        else if (event.key === 'h') {
            invertWeights();
        }

        // RANDOMIZE WEIGHTS
        else if (event.key === '@') {
            randomizeWeights();
        }

        // VIEW IMAGES FROM SELECT SAVED IMAGES
        else if (event.key === 'v') {
            loadSubdirectory();
            // prompt user for the subdirectory name
            const subDir = prompt("Enter the subdirectory name to view images:");
            if (subDir === null || subDir.trim() === "") {
                alert("Subdirectory name is required.");
                return;
            }
            // find the images using savedImages array
            let subImages = savedImages.filter((path) => path.includes(subDir));
            console.log('Subdirectory images:', subImages);
            
            // remove the subdirectory name from the path
            subImages = subImages.map((path) => path.replace(subDir, ''));
            // remove the first character which is a '/'
            subImages = subImages.map((path) => path.substring(1))
            
            // find subImages in the images array. put these in an index array
            let subIndexes = [];
            subImages.forEach((path) => {
                // strip the extension before comparing
                path = path.split('.')[0];
                const index = images.findIndex((image) => image.includes(path));
                if (index !== -1) {
                    subIndexes.push(index);
                }
            });
            
            // use the subIndexes array to find the images in the images array
            subImages = subIndexes.map((index) => images[index]);
            
            // set the weights for the subImages to a value specified by user. use subIndexes
            const weight = prompt("Enter a weight for the subdirectory images:", "10");
            if (weight === null || weight.trim() === "") {
                alert("Weight is required.");
                return;
            }
            const weightValue = parseInt(weight, 10);
            console.log('Weight:', weightValue);
            setImageWeights((prevWeights) => {
                const newWeights = [...prevWeights];
                subIndexes.forEach((index) => {
                    newWeights[index] = weightValue;
                });
                return newWeights;
            });
            
        }

        // HIDE BUTTONS
        else if (event.key === 'b') {
            toggleHideButtons();
        }

        // CLOSE THE APP
        else if (event.key === 'Escape') {
            window.close();
        }
        // TESTING
    
    };

    
    
    // -----------------------------------------------
    //
    // -----------------------------------------------

    // LOAD IMAGE FROM INDEX
    
    const goToIndex = () => {
        const userInput = prompt("Enter an image index:");
        const index = parseInt(userInput, 10);
    
        if (!isNaN(index) && index >= 0 && index < images.length) {
            setCurrentIndex(index);
            // add the index to the previous images array
            setPrevImages((prevImages) => [...prevImages, index]);
        } else {
            alert("Invalid index. Please enter a number between 0 and " + (images.length - 1));
        }
    };


    // LOAD IMAGE FROM FILENAME

    const goToFilename = () => {
        const userInput = prompt("Enter an image filename:");
        const index = images.findIndex((path) => {
            const fullPath = path.split('/').pop();
            const baseName = fullPath.split('.')[0];
            const extension = fullPath.split('.').pop();
            return `${baseName}.${extension}` === userInput;
        });
        if (index !== -1) { 
            setCurrentIndex(index);
            setPrevImages((prevImages) => [...prevImages, index]);
        } else {
            alert("File not found.");
        }
    };


    // SAVE IMAGE TO DISK   

    const saveImage = async ( index ) => {

        const currentImage = images[index];
        const defaultPath = 'D:\\proj\\ph0\\src\\imgSav';
    
        try {
            console.log(currentImage);
            // currentImage = /static/media/{FILENAME.extension}
            var fileName = currentImage.split('/')[3];
            // fileName = fileName.split('.')[0];  
            fileName = fileName.substring(0, fileName.lastIndexOf('.'));
            console.log(fileName);
            const response = await fetch(currentImage);
            const blob = await response.blob();
            saveAs(blob, fileName );
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Failed to save image.');
        }
    };

    // SET WEIGHT FOR CURRENT IMAGE

    const setWeightForCurrentImage = () => {
        const weight = prompt("Enter a weight for the current image:","11");
        if (weight === null || weight.trim() === "") {
            alert("Weight is required.");
            return;
        }
        const weightValue = parseInt(weight, 10);
        if (!isNaN(weightValue)) {
            setImageWeights((prevWeights) => {
                const newWeights = [...prevWeights];
                newWeights[currentIndex] = weightValue;
                return newWeights;
            });
        } else {
            alert("Invalid weight. Please enter a number.");
        }
    };


    // COPY FILE NAME TO CLIPBOARD

    const copyFileNameToClipboard = () => {
        const fullPath = images[currentIndex].split('/').pop();
        const baseName = fullPath.split('.')[0];
        const extension = fullPath.split('.').pop();
        const fullFileName = `${baseName}.${extension}`;
        // For example, copy the filename to the clipboard:
        navigator.clipboard.writeText(fullFileName)
            .then(() => console.log(`Copied ${fullFileName} to clipboard`))
            .catch((err) => console.error('Failed to copy file name:', err));
    };


    // COPY INDEX TO CLIPBOARD

    const copyIndexToClipboard = () => {
        navigator.clipboard.writeText(currentIndex) 
            .then(() => console.log(`Copied ${currentIndex} to clipboard`))
            .catch((err) => console.error('Failed to copy index:', err));
    }


    // LOAD SUBDIRECTORY
    const loadSubdirectory = () => {
        const subDir = prompt("Enter the subdirectory name to view images:");
        if (subDir === null || subDir.trim() === "") {
            alert("Subdirectory name is required.");
            return;
        }
        // find the images using savedImages array
        let subImages = savedImages.filter((path) => path.includes(subDir));
        console.log('Subdirectory images:', subImages);
        
        // remove the subdirectory name from the path
        subImages = subImages.map((path) => path.replace(subDir, ''));
        // remove the first character which is a '/'
        subImages = subImages.map((path) => path.substring(1))
        
        // find subImages in the images array. put these in an index array
        let subIndexes = [];
        subImages.forEach((path) => {
            // strip the extension before comparing
            path = path.split('.')[0];
            // if the path includes a subdirectory name, remove it
            const subDirName = path.split('/')[0];
            console.log('subDirName:', subDirName);
            console.log('path:', path);
            // path = path.replace(subDirName, '');
            
            const index = images.findIndex((image) => image.includes(path));
            if (index !== -1) {
                subIndexes.push(index);
            }
        });
        
        // use the subIndexes array to find the images in the images array
        subImages = subIndexes.map((index) => images[index]);
        
        // set the weights for the subImages to a value specified by user. use subIndexes
        const weight = prompt("Enter a weight for the subdirectory images:", "10");
        if (weight === null || weight.trim() === "") {
            alert("Weight is required.");
            return;
        }
        const weightValue = parseInt(weight, 10);
        console.log('Weight:', weightValue);
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            subIndexes.forEach((index) => {
                newWeights[index] = weightValue;
            });
            return newWeights;
        });

    }


    // LOAD FROM PARTIAL FILENAME
    const loadFromPartialFilename = () => {
        const partialName = prompt("Enter a partial filename to load images:");
        if (partialName === null || partialName.trim() === "") {
            alert("Partial filename is required.");
            return;
        }
        const filteredImages = images.filter((path) => path.includes(partialName));
        // set the weights for the filteredImages to a value specified by user
        const weight = prompt("Enter a weight for the filtered images:", "10");
        if (weight === null || weight.trim() === "") {
            alert("Weight is required.");
            return;
        }
        const weightValue = parseInt(weight, 10);
        console.log('Weight:', weightValue);
        setImageWeights((prevWeights) => {
            const newWeights = [...prevWeights];
            filteredImages.forEach((image) => {
                const index = images.indexOf(image);
                if (index !== -1) {
                    newWeights[index] = weightValue;
                }
            });
            return newWeights;
        });
        // put it on the stack?
        // setImageStack(filteredImages.map((image) => images.indexOf(image)));
    };


    // ----  USE EFFECTS -------------------------------

    // INDEX CHANGE USE EFFECT

    useEffect(() => {
        console.log('Current index updated:', currentIndex);
    }, [currentIndex]);


    // RANDOM PLAY USE EFFECT

    useEffect(() => {
        if (isRandomPlay) {
            const interval = setInterval(randomImage, randomPlayInterval);
            return () => clearInterval(interval);
        }
    }, [isRandomPlay, randomPlayInterval]);


    // STACK RANDOM PLAY USE EFFECT

    useEffect(() => {
        if (isStackRandomPlay) {
            const interval = setInterval(() => {
                if (imageStack.length > 0) {
                    const randomIndex = Math.floor(Math.random() * imageStack.length);
                    setCurrentIndex(imageStack[randomIndex]);
                }
            }, randomPlayInterval);
            return () => clearInterval(interval);
        }
    }, [isStackRandomPlay, randomPlayInterval, imageStack]);


    // KEYDOWN EVENT LISTENER USE EFFECT

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [ handleKeyDown]);


    // FIRST TIME USE EFFECT

    useEffect(() => {

        console.log("#images: ", images.length)
        const firstImageIndex = Math.floor(Math.random() * images.length);
        setCurrentIndex(firstImageIndex);
        setPrevImages([firstImageIndex]);

        const handleContextMenu = (event) => {
            event.preventDefault();
            randomImage();
        };
    
        window.addEventListener("contextmenu", handleContextMenu);
        
        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
        };

    }, []);


    // DISPLAY JSX

    return (
        <div id="img-container" style={styles.container}>
            <img src={images[currentIndex]} alt="carousel" style={styles.image} />
            <button onClick={loadFromPartialFilename} className='action-button' style={styles.partialButton}>{"pf"}</button>
            <button onClick={prevImage} className='action-button' style={styles.leftArrow}>{"<"}</button>
            <button onClick={randomPlay} className='action-button' style={styles.randomButton}>{"R"}</button>
            { state.isMobile ? ( <>
                <button onClick={loadWeights} className="action-button" style={styles.weightButton}>{"lw"}</button>
                <button onClick={setWeightForCurrentImage} className="action-button" style={styles.setWeightButton}>{"sw"}</button>
                <button onClick={loadSubdirectory}className="action-button" style={styles.loadSub}>{"sb"}</button>
                </>
            ) : (
                <button onClick={loadWeights} className="action-button" style={styles.weightButton}>{"W"}</button>
            )}
            <button onClick={nextImage} className='action-button' style={styles.rightArrow}>{">"}</button>
            <button onClick={gobackImage} className='action-button' style={styles.leftArrow2}>{"<<"}</button>
            <button onClick={randomImage} className='action-button' style={styles.rightArrow2}>{">>"}</button>
            <button onClick={copyFileNameToClipboard} className='action-button' style={styles.fileName}>{images[currentIndex].split('/').pop().split('.')[0]}</button>
            <button onClick={test} className='action-button' style={styles.imageWeight}>{imageWeights[currentIndex]}</button>
            <button onClick={copyIndexToClipboard} className='action-button' style={styles.currentIndex}>{currentIndex}</button>
        </div>
    );



// STYLE DEFINITIONS AT TOP



};
export default ImageCarousel;
