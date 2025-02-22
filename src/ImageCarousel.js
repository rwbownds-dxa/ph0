import React, { useState, useEffect } from "react";
import { saveAs } from 'file-saver';

// Import all images from the src/img directory
const images = require.context("./img", false, /\.(jpg|gif)$/).keys().map((path) => require(`./img/${path.replace('./', '')}`));

const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRandomPlay, setIsRandomPlay] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [ previousImages, setPrevImages ] = useState([]);
    const [ reverseImages, setReverseImages ] = useState([]);
    const [ isDirectionForward, setIsDirectionForward ] = useState(true);
    const [ randomPlayInterval, setRandomPlayInterval ] = useState(6000);

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
            randomIndex = Math.floor(Math.random() * images.length);
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


    // EVENT HANDLERS FOR KEYS

    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight") {
            nextImage();
        } else if (event.key === "ArrowLeft") {
            prevImage();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            randomImage();
        } else if (event.key === "r") {
            setIsRandomPlay((prev) => !prev);
        } else if (event.key === "z") {
            changeZoom('+');
        } else if (event.key === "x") {
            changeZoom('-');
        } else if (event.key === "c") {
            changeZoom('1');
        } else if (event.key >= '0' && event.key <= '9') {  // change the random play interval
            const interval = event.key === '0' ? 10 : parseInt(event.key, 10);
            setRandomPlayInterval(interval * 1000);
        } else if (event.key === '.') {   // Go to a specific image index
            setRandomPlayInterval(randomPlayInterval / 7 );
        } else if (event.key === ',') {   // Go to a specific image index
            setRandomPlayInterval(randomPlayInterval * 3 );

        } else if (event.key === 'n') {   // Go to a specific image index
            goToIndex();
        } else if (event.key === 's') {   // Save the current image
            saveImage(currentIndex);
        }
    };
    
    
    const goToIndex = () => {
        const userInput = prompt("Enter an image index:");
        const index = parseInt(userInput, 10);
    
        if (!isNaN(index) && index >= 0 && index < images.length) {
            setCurrentIndex(index);
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
            <button onClick={test} style={styles.rightArrow3}>{currentIndex}</button>
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
  rightArrow3: {
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
