import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { firestore } from './firebase';

import 'react-contexify/ReactContexify.css';

import {
  Modal,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

function timeout(delay) {
  return new Promise( res => setTimeout(res, delay) );
}

export function Gallerypage () {

  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)

  const containerRef = useRef(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [imageId, setImageId] = useState(null);
  const [whoIs, setWhoIs] = useState(null);
  const [originalimageId, setOriginalimageId] = useState(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const openModal = (imageURL, isType, id, original, who) => {
    setSelectedImage(imageURL);
    setSelectedVideo(isType);
    setImageId(id);
    setOriginalimageId(original);
    setWhoIs(who);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setImageId(null);
    setOriginalimageId(null);
    setWhoIs(null);
    setModalIsOpen(false);
  };

  const useStyles = makeStyles((theme) => ({
      ImagePopUp: {
        position: 'relative',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: "80%",
        backgroundColor: theme.palette.background.paper,
        border: "3px solid #385c8f",
        boxShadow: theme.shadows[5],
        padding: '10px 10px 10px',
        textAlign: "center",
        maxWidth: "400px",
        maxHeight: "600px"
      },
      img:{
          maxWidth: "280px",
          maxHeight: "600px"
      },
      reply: {
        position: 'relative',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: "70%",
        backgroundColor: theme.palette.background.paper,
        border: "3px solid #385c8f",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(0, 3, 1),
        align: "center",
        maxWidth: "400px"
      },
      formControl: {
        // display: 'block',
        margin: theme.spacing(1),
        '& > *': {
          width: '90%'
        }
      }
    }));
  const classes = useStyles();
  const ITEMS_PER_PAGE = 9;
  const bottomListRef = useRef();

  const [images, setImages] = useState([]);
  const [lastImage, setLastImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
  
    try {
      const imagesRef = firestore.collection('gallery');
      let query = imagesRef.orderBy('createdAt', 'desc').limit(ITEMS_PER_PAGE);
  
      if (lastImage) {
        query = query.startAfter(lastImage);
      }
  
      const snapshot = await query.get();
      const newImageInforms = [];
  
      for (const doc of snapshot.docs) {
        const imageInform = {
          id: doc.id,
          ...doc.data()
        };
        newImageInforms.push(imageInform);
      }
  
      setImages((prevImageInforms) => [...prevImageInforms, ...newImageInforms]);
  
      if (snapshot.docs.length > 0) {
        const lastImageDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastImage(lastImageDoc);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const loadMoreImages = () => {
    fetchImages();
    bottomListRef.current.scrollIntoView({ behavior: 'smooth'});
  };
  const [marginTop, setMarginTop] = useState(50);
  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = document.querySelector('header').offsetHeight;
      if (window.pageYOffset > headerHeight) {
        setMarginTop(headerHeight);
      } else {
        setMarginTop(0);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const unlike = async (e) =>{
    if (window.confirm("갤러리에서 삭제할 거예요? 😥")) {
      await firestore.collection('gallery').doc(imageId).delete();
      await firestore.collection('images').doc(originalimageId).set({
        isLiked:false,
      },
      { merge: true }
      );
      alert("삭제했어여 ❤️‍🩹");
    }
    else {
      alert("취소했어여 ❤️‍🔥");
    }
    console.log(imageId);
    closeModal();
    await timeout(1000);
    window.location.reload();
  }


  return (
  <div className="App">
      <header style={{ paddingLeft: "10px", paddingRight: "15px"}}>
          <Link to="/">
          <div className='button_back'>⏪</div>
          </Link>
          <div className='m' style={{ fontWeight: "bold", fontSize: "1.1rem"}}>
          <Link to="/album">
          <div className='button_back'>📷ㅤ</div>
          </Link>Gallery</div>
      </header>
      <div ref={containerRef} className="main_image">
      <div className="gallery-grid">
          {images && images.map(image =>
          <div key = {image.id} className="gallery-item">
            {image.isType?<>
            <video preload='true' muted height={"100px"} onClick={() => openModal(image.imageURL, image.isType, image.id, image.originalId, image.whoIs)}>
            <source src={image.imageURL}></source>
            </video>
            <div className='icon'>🎥</div>
            </>
            :<img src={image.imageURL} alt={image.id}
              onClick={() => openModal(image.imageURL, image.isType, image.id, image.originalId, image.whoIs)}/>}
          </div>
          )}
      <span ref={bottomListRef}></span>
      </div>
      </div>
      <Modal
        open={modalIsOpen} onClose={(e) => closeModal()}>
        <div className={classes.ImagePopUp} >
          <button style={{position:'fixed', top:"0", right:"0", backgroundColor:"#ffffff00"}} onClick={()=>closeModal()}>✖️</button>
          {selectedVideo?
          <video controls muted height={"250px"}>
          <source src={selectedImage}></source>
          </video>:
          <img className={classes.img} src={selectedImage} style={{maxHeight:'500px'}} alt="Preview"/>}
          <br></br>
          <br></br>
          {whoIs==="Z7mCYAOqVnYl1xPaG1ezgwECQ0D3"? 
          <div className='show_reply' style={{position:'fixed', bottom:"1px", right:"3px"}}>Mandeuk's pick ♡</div>:
          <div className='show_reply' style={{position:'fixed', bottom:"1px", right:"3px"}}>Dooboo's pick ♡</div>}
          <button onClick={(e) => unlike()}
          style={{position:'fixed', bottom:"15px", right:"0px", backgroundColor:"#ffffff00"}}
          ><img height="25" src={'/icons/likedelete.png'} alt="delete"/></button>
          <br></br>
        </div>
      </Modal>
      {loading &&
      <div className="image-load" style={{bottom:"7vh"}}>
      <img height="40" src={'/icons/loading.gif'}  alt="loading"/>
      </div>}
      <button className="image-load" style={{bottom:"2vh"}} onClick={loadMoreImages}> 
      <img height="30" src={'/icons/load.png'} alt="load"/>
      </button>
  </div>
  );
}

export default Gallerypage;