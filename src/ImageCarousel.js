import React, { useState, useEffect } from "react";

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

    const randomImage = () => {
      let randomIndex;
      if (reverseImages.length > 0) {
        randomIndex = reverseImages.pop();
        setCurrentIndex(randomIndex);
        setPrevImages([...previousImages, randomIndex]);
        return;
      } else { 
      do {
          randomIndex = Math.floor(Math.random() * images.length);
      } while (randomIndex === currentIndex);  // Ensure that the new image is different from the current one

      setCurrentIndex(randomIndex);
      setPrevImages([...previousImages, randomIndex]);
      setIsDirectionForward(true);
      console.log(previousImages);
      console.log(reverseImages);
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
        // Update the zoom state first
        setZoom((prevZoom) => {
            const newZoom = direction === '+' ? prevZoom + 10 : prevZoom - 10;
            // Apply the new zoom value to the img-container element
            const img = document.querySelector('#img-container');
            if (img) {
                img.style.transform = `scale(${newZoom / 100})`;
            }
            return newZoom;
        });
    };

    // Handle keydown events for left and right arrow keys
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
        } else if (event.key >= '0' && event.key <= '9') {
            const interval = event.key === '0' ? 10 : parseInt(event.key, 10);
            setRandomPlayInterval(interval * 1000);
        }
    };

    useEffect(() => {
        if (isRandomPlay) {
            const interval = setInterval(randomImage, randomPlayInterval);
            return () => clearInterval(interval);
        }
    }, [isRandomPlay, randomPlayInterval]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

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

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
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
