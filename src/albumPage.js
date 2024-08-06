import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import imageCompression from "browser-image-compression";

import { firestore, auth, storage } from './firebase';
import firebase from 'firebase/compat/app';
import { useCollection } from 'react-firebase-hooks/firestore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import 'react-contexify/ReactContexify.css';

import {
  Button,
  Modal,
  Input,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

function timeout(delay) {
  return new Promise( res => setTimeout(res, delay) );
}

function ImageUploader({onImageUpload}) {
  const [file, setFile] = useState(null);
  const [video, setVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileInputChange = async (event) => {
    const selectedFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(selectedFile);
  
    const options = {
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 1920, 
      useWebWorker: true,
    };

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (fileExtension === "mp4" || fileExtension === "avi" || fileExtension === "mov") {
        setFile(selectedFile);
        setVideo(true);
      }

    else{
      const compressedFile = await imageCompression(selectedFile, options);
      setFile(compressedFile);
      setVideo(false);
    }
  };

  const handleUploadButtonClick = () => {
    const storageRef = storage.ref();
    const imagesRef = storageRef.child("images");
    const imageRef = imagesRef.child(file.name);

    const messagesRef = firestore.collection('images');
    imageRef.put(file).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((downloadURL) => {
        messagesRef.add({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: video,
          imageUrl:downloadURL
        })
      });
    });
      
    onImageUpload();

    setFile('');
    setPreviewUrl('');
  };

  const handleDeleteButtonClick = () =>{
    setFile('');
    setPreviewUrl('');
  }

  const ref = useRef(null);

  const onClick = () => {
    ref.current?.click();
  };

  return (
  <>
      <button className="File" onClick={()=>{onClick()}} style={{marginLeft:"0", bottom:"7vh", backgroundColor:"#ffffff00"}}> <img height="40" src={'/icons/upload.png'} alt="icon"/>
      <input hidden type="file" accept="video/*, image/*" onChange={handleFileInputChange} ref={ref}/>
      </button>
      <div className="fileSelector_album">
        <div className='button_f' type='button' onClick={handleUploadButtonClick}>{previewUrl && <img src={previewUrl} alt="Video" height="150vh" margin="0" style={{borderRadius:'20%'}} />}
        </div>
        <div className='button_d' onClick={handleDeleteButtonClick}>{previewUrl && <>❌</>}</div>
      </div>
  </>
  );
}


export function Albumpage () {

  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)

  const containerRef = useRef(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [textIsOpen, setTextIsOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [replyMessage, setReplyMessage] = useState(null);
  const [date, setDate] = useState(null);

  const openModal = (imageUrl, Ddate, uid) => {
    setSelectedImage(imageUrl);
    setSelectedVideo(uid);
    setDate(format(new Date(Ddate.seconds * 1000),'PP',{locale: ko}));
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setDate(null);
    setModalIsOpen(false);
  };

  const textModalOpen = () =>{
    setTextIsOpen(true);
  }

  const closeTextModal = () => {
    setTextIsOpen(false);
  }

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
  const ITEMS_PER_PAGE = 20;
  const bottomListRef = useRef();

  const [images, setImages] = useState([]);
  const [lastImage, setLastImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);

    try {
      const imagesRef = firestore.collection('images');
      let query = imagesRef.orderBy('createdAt', 'desc').limit(ITEMS_PER_PAGE);
      
      if (lastImage) {
        query = query.startAfter(lastImage);
      }

      const snapshot = await query.get();
      const newImageInforms = [];

      for (const doc of snapshot.docs) {
        const imageInform = doc.data();
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

  const k = firestore.collection('messages_new').orderBy('createdAt').limitToLast(1);
  const [date_check] = useCollection(k, { idField: 'id' });

  const reply = async (e) => {
    const { uid, photoURL } = auth.currentUser;
    var dates, date_flag;
    date_check.docs.map(date_ch => dates = date_ch.data().createdAt);
    const temp_dates = format(new Date(dates.seconds * 1000), 'PP', {locale: ko});

    var today = new Date();
    const cur_date = format(today,'PP',{locale: ko});
    if (cur_date !== temp_dates){
      date_flag = cur_date;
    }
    else{
      date_flag = false;
    }
    var vflag = selectedVideo?"video":"image";
    await firestore.collection('messages_new').add({
        text: replyMessage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        date_div:date_flag,
        uid,
        photoURL,
        isRead:false,
        imageUrl:false,
        isEmoji:false,
        isReply:vflag,
        isReplyImg:selectedImage,
        react:false,
        replyId:false
      })

    setReplyMessage('');
    setTextIsOpen(false);
  };

  const like = async (e) =>{
    await firestore.collection('gallery').add({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isType:selectedVideo,
        imageURL:selectedImage,
      })

      setReplyMessage('');
      closeModal();
  };


  const onCheckKey = (e) => {
    if(e.key === 'Enter') {
      reply();
    }
    if(e.key === 'Escape'){
      e.preventDefault();
      setTextIsOpen(false);
    }
  }
  const handleImageUpload = async ()=>{
    await timeout(3000);
    window.location.reload();
  }

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


  return (
  <div className="App">
      <header style={{ paddingLeft: "10px", paddingRight: "15px"}}>
          <Link to="/">
          <div className='button_back'>⏪</div>
          </Link>
          <div className='m' style={{ fontWeight: "bold", fontSize: "1.1rem"}}>
          <Link to="/gallery">
          <div className='button_back'>💓ㅤ</div>
          </Link>Album</div>
      </header>
      <div ref={containerRef} className="main_image" style={{ marginTop: `${marginTop}px` }}>
      <div className="image-grid">
          {images && images.map(image =>
          <div key={image.id} className="image-item">
            {image.uid?<>
            <video preload='true' muted height={"100px"} onClick={() => openModal(image.imageUrl, image.createdAt, image.uid)}>
            <source src={image.imageUrl}></source>
            </video>
            <div className='icon'>🎥</div>
            </>
            :<img src={image.imageUrl} alt={image.id}
              onClick={() => openModal(image.imageUrl, image.createdAt, image.uid)}/>}
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
          <button onClick={(e)=>like()}><img height="25" src={'/icons/like.png'} alt="like"/></button>
          <button 
          style={{position:'fixed', bottom:"15px", right:"0px", backgroundColor:"#ffffff00"}}
          onClick={()=>textModalOpen()}><img height="25" src={'/icons/reply.png'} alt="reply"/></button>
          <br></br>
          <div className='show_reply' style={{position:'fixed', bottom:"1px", right:"3px"}}>{date}</div>
        </div>
      </Modal>
      <Modal 
        open={textIsOpen} onClose={(e) => closeTextModal()} onKeyDown ={onCheckKey}>
        <div className={classes.reply} >
        <div className={classes.formControl}>
          <Input
            disableTypography
            placeholder="사진에 답장하슈 ♡"
            value={replyMessage}
            style={{ fontFamily: "TheJamsil2Light"}}
            onChange={(event) => setReplyMessage(event.target.value)}
          />        
        </div>
        <div className='reply_buttons'>
          <Button onClick={(e) => reply()} style={{ fontFamily: "TheJamsil2Light"}}> reply</Button>
          <Button onClick={(e) => closeTextModal()} style={{ fontFamily: "TheJamsil2Light"}}> close</Button>
        </div>
        </div>

      </Modal>

      {loading &&
      <div className="image-load" style={{bottom:"7vh"}}>
      <img height="40" src={'/icons/loading.gif'}  alt="loading"/>
      </div>}
      <button className="image-load" style={{bottom:"2vh"}} onClick={loadMoreImages}> 
      <img height="30" src={'/icons/load.png'} alt="load"/>
      </button>
      <ImageUploader onImageUpload={handleImageUpload} />
  </div>
  );
}

export default Albumpage;