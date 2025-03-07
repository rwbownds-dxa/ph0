import React, { useState, useEffect } from "react";
import { saveAs } from 'file-saver';

// Import all images from the src/img directory
// const images = require.context("./img", false, /\.(jpg|gif)$/).keys().map((path) => require(`./img/${path.replace('./', '')}`));

// Import all images from the src/imgNew directory
let newImages = [];
try {
    newImages = require.context("./imgNew", false, /\.(jpg|gif)$/).keys().map((path) => require(`./imgNew/${path.replace('./', '')}`));
} catch (error) {
    console.error("Error loading images from imgNew:", error);
}
console.log('newImages: ', newImages);
// Import all images from the src/img directory
const standardImages = require.context("./img", false, /\.(jpg|gif)$/).keys().map((path) => require(`./img/${path.replace('./', '')}`));
console.log ('standardImages: ', standardImages);
// Combine the images and assign weights
const images = [...newImages, ...standardImages];
const initialWeights = [...Array(newImages.length).fill(20), ...Array(standardImages.length).fill(1)];

// console.log('images: ', images);

const ImageCarousel = () => {
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


    // EVENT HANDLERS FOR KEYS

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
            setIsRandomPlay((prev) => !prev);

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
            const fileName = prompt("Enter the name of the file to load:");
            if (!fileName) {
                alert("Filename is required.");
                return;
            }   
            const index = images.findIndex((path) => {
                const fullPath = path.split('/').pop();
                const baseName = fullPath.split('.')[0];
                const extension = fullPath.split('.').pop();
                return `${baseName}.${extension}` === fileName;
            });
            if (index !== -1) {
                setCurrentIndex(index);
                setPrevImages((prevImages) => [...prevImages, index]);
            } else {
                alert("File not found.");
            }   

            
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

        // Set the weight of the current image
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
            // save current weights to local storage
            // prompt user for a name
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

                // localStorage.setItem('imageWeights', JSON.stringify(imageWeights));

        // LOAD WEIGHTS        
        } else if (event.key === 'd') {    

            const name = prompt("Enter the name of the weights to load:");
            if (!name) {
                alert("Name is required.");
                return;
            }
            
            let weights;

            // if the name begins with 'f-', load the weights from a file. put the weights in the weights variable
            if (name.startsWith('f-')) {
                const fileName = name.substring(2) + '.json';
                const response = await fetch(fileName);
                console.log('fileName:', fileName);
                console.log('response:', response);

                const data = await response.json();
                weights = data;
            
            } else {
            weights = JSON.parse(localStorage.getItem(name));
            }
            
            if (weights) {
                const newWeights = Array(images.length).fill(1);
                weights.forEach((weight) => {
                    const index = images.findIndex((path) => {
                        const fullPath = path.split('/').pop();
                        const baseName = fullPath.split('.')[0];
                        const extension = fullPath.split('.').pop();
                        return `${baseName}.${extension}` === weight.name;
                    });
                    if (index !== -1) {
                        newWeights[index] = weight.weight;
                    }
                });
                setImageWeights(newWeights);
            } else {
                alert("Weights not found.");
            }
            
            /* const savedWeights = localStorage.getItem('imageWeights');
            if (savedWeights) {
                setImageWeights(JSON.parse(savedWeights));
            } else {
                alert('No saved weights found.');
            } */
        }
    
    };
    
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
        const weight = prompt("Enter a weight for the current image:");
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
            <button onClick={prevImage} style={styles.leftArrow}>{"<"}</button>
            <button onClick={nextImage} style={styles.rightArrow}>{">"}</button>
            <button onClick={gobackImage} style={styles.leftArrow2}>{"<<"}</button>
            <button onClick={randomImage} style={styles.rightArrow2}>{">>"}</button>
            <button onClick={copyFileNameToClipboard} style={styles.fileName}>{images[currentIndex].split('/').pop().split('.')[0]}</button>
            <button onClick={test} style={styles.imageWeight}>{imageWeights[currentIndex]}</button>
            <button onClick={test} style={styles.currentIndex}>{currentIndex}</button>
        </div>
    );
};


// STYLE DEFINITIONS

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
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '2rem',
      color: '#fff',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      zIndex: 1,
  },
  rightArrow: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '2rem',
      color: '#fff',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      zIndex: 1,
  },
  leftArrow2: {
    position: 'absolute',
    right: '10px',
    top: '65%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  },
  rightArrow2: {
    position: 'absolute',
    right: '10px',
    top: '60%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  },
  fileName: {
    position: 'absolute',
    right: '10px',
    top: '78%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  },
  imageWeight: {
    position: 'absolute',
    right: '10px',
    top: '84%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  },
  currentIndex: {
    position: 'absolute',
    right: '10px',
    top: '90%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1,
  }
};

export default ImageCarousel;
