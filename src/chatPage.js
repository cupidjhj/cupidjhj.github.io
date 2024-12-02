import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import { auth, firestore, storage, firestore_ } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';

import 'react-contexify/ReactContexify.css';

import imageCompression from "browser-image-compression";
import useHover from './useHover';
import {
  Button,
  Modal,
  Input,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";


import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

var withoutEmoji = require('emoji-aware').withoutEmoji;
var yourId;
const str = '\n';

export  function ChatPage() {
  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)

  const [user] = useAuthState(auth);

  const { currentUser } = auth;
  const uid = currentUser ? currentUser.uid : null;
  yourId = (uid==="Z7mCYAOqVnYl1xPaG1ezgwECQ0D3"?"nMFxa9jp0iUxOtgqSgsWXuHvKqg1":"Z7mCYAOqVnYl1xPaG1ezgwECQ0D3");
  
  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function OnlineStatus({ userId, myId, onReload }) {
  useEffect(() => {
    const userRef = firestore_.collection('users').doc(myId);

    const handleWindowClose = () => {
      userRef.set({
          online: false,
          lastActive: new Date(),
        },
        { merge: true }
      );
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        userRef.set({
            online: true,
            lastActive: new Date(),
          },
          { merge: true }
        );
      } else {
        userRef.set({
            online: false,
            lastActive: new Date(),
          },
          { merge: true }
        );
      }
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        userRef.set(
          {
            online: false,
            lastActive: new Date(),
          },
          { merge: true }
        );
      } else {
        onReload();
        userRef.set(
          {
            online: true,
            lastActive: new Date(),
          },
          { merge: true }
        );
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    window.addEventListener("unload", handleWindowClose);
    window.addEventListener("pagehide", handleWindowClose);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handleWindowClose);
      window.removeEventListener("beforeunload", handleWindowClose);
      window.removeEventListener("unload", handleWindowClose);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeAuth();
    };
  }, [myId]);

  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStatus, setMenuStatus] = useState(false);

  useEffect(() => {
    const userRef = firestore_.collection('users').doc(userId);
    const unsubscribe = userRef.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (data) {
        setIsOnline(data.online);
        setLastActive(data.lastActive.toDate());
      }
    });

    return () => {
      unsubscribe();
    }
  }, [userId]);

  useEffect(() => {
    const userRef_ = firestore_.collection('users_chat').doc(userId);
    const chatStatus = userRef_.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (data) {
        setIsTyping(data.chat);
      }
    });
    return () => {
      if(isOnline){
        chatStatus();
      }
    }
  }, [userId, isOnline]);

  const onClickMenu = () => {
    setMenuStatus((prevStatus) => !prevStatus);
  };

  const MenuIn = () => (
    <div id="gnbMenu" className="pt-4 pb-8">
      <div className="menu-list">
        <a className="menu-item" href="/memo" style={{ textDecoration: "none" }}>📝 memo</a>
        <a className="menu-item" href="/calendar" style={{ textDecoration: "none" }}>📅 calendar</a>
        <a className="menu-item" href="/album" style={{ textDecoration: "none" }}>📷 album</a>
        <a className="menu-item" href="/gallery" style={{ textDecoration: "none" }}>🖼️ gallery</a>
      </div>
    </div>
  );

  return (
    <>
      <header><div style={{display:'flex'}}>
        <div className="menu">
          <button onClick={onClickMenu} style={{backgroundColor:"#ffffff00", zIndex:'99'}}>
            <img height="17" src={'/icons/right.png'} alt="right"/>
          </button>
          {menuStatus ? <MenuIn /> : null}
        </div>
        <div className='lastActive'>
        {isOnline ?<img height="30" src={'/icons/online.png'} alt="icon"/>:<img height="30" src={'/icons/offline.png'} alt="icon"/>}
        {lastActive && <div className='reply_text' style={{fontSize:"0.7rem"}}>Last Active ღ {format(lastActive, 'a hh:mm', { locale: ko })}</div>}
      </div>
      </div>
        <button style={{backgroundColor:"#ffffff00", zIndex:'99', right:'5px'}} onClick={() => auth.signOut()} >
          <img height="15" src={'/icons/dot.png'} alt="dot" />
        </button>
      </header>
      {isOnline ?<>{isTyping?<div className='bottom_'>
    <img height="60" src={'/icons/chatting.gif'} style={{backgroundColor:"#ffffff00"}} alt="icon"/></div>:null}</>:null}
    </>
  );
}

function SignIn() {

  var provider = new firebase.auth.GoogleAuthProvider();
  const signInWithGoogle = () => auth.signInWithPopup(provider);  
  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <br></br>
      <div className='m'> ❤️ Hi JHJ ❤️</div>
      <div className='m' style={{ fontSize: "0.8rem" }}>ღ 오늘도 사랑해요 이쁜이 ღ</div>
    </>
  );
}

  function ImageUploader({ onUpload }) {
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
      const imagesRef = storageRef.child("images_nop");
      const imageRef = imagesRef.child(file.name);

      const messagesRef = firestore.collection('images_nop');
      imageRef.put(file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          onUpload(downloadURL, video);
          messagesRef.add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid: video,
            imageUrl:downloadURL
          })
        });
      });
        

      setFile('');
      setPreviewUrl('');
    };

    const handleDeleteButtonClick = () =>{
      setFile('');
      setPreviewUrl('');
    }

    const ref = useRef(null);

    const onClick = () => {
      ref.current?.focus();
      ref.current?.click();
    };
  
    return (
      <div className='File'>
        <div className="fileSelector">
          <div className='button_f' type='button' onClick={()=>{onClick()}}> <img height="22" src={'/icons/cam.png'} alt="icon"/>
          <input hidden type="file" accept="video/*, image/*" onChange={handleFileInputChange} ref={ref}/></div>
          <div className='button_f' type='button' onClick={handleUploadButtonClick}>{previewUrl && <img src={previewUrl} alt="Video" height="150vh" margin="0" style={{borderRadius:'20%'}} />}
          </div>
          <div className='button_d' onClick={handleDeleteButtonClick}>{previewUrl && <>❌</>}</div>
        </div>
      </div>
    );
  }

  function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
  }
  function ChatRoom() {
    const textarea = useRef();
    const bottomListRef = useRef();
    const [bottom, setBottom] = useState(false);
  
    const [user] = useAuthState(auth);
    const messagesRef = firestore.collection('messages_nop');
    let query = messagesRef.orderBy('createdAt').limitToLast(300);
    const k = messagesRef.orderBy('createdAt').limitToLast(1);
  
    const [messages] = useCollection(query, { idField: 'id' });
    const [date_check] = useCollection(k, { idField: 'id' });
  
    const [formValue, setFormValue] = useState('');
    const [chatStatus, setChatStatus] = useState('');
    const [yourStatus, setYourStatus] = useState('');
    const [beforeChatStatus, setBeforeChatStatus] = useState('');
    let flag;
    const { uid } = auth.currentUser;
    const dates_check = cur_date =>{
      var dates;
      date_check.docs.map(date_ch => dates = date_ch.data().createdAt);
      const temp_dates = format(new Date(dates.seconds * 1000), 'PP', {locale: ko});
      if (cur_date !== temp_dates){
        return cur_date;
      }
      else{
        return false;
      }
    }
    const [time, setTime] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => {
          setTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const checkChatStatus = useCallback(() =>{
      if (yourStatus){
        setChatStatus(true);
        setTime(0);
        if (chatStatus!==beforeChatStatus){
          const userRef = firestore_.collection('users_chat').doc(uid);
          userRef.set({
            chat: true
          },
          { merge: true }
          );
          setBeforeChatStatus(true);
        }
      }
    }, [yourStatus, chatStatus, beforeChatStatus, uid]);

    const stopChat = useCallback(() => {
      const userRef = firestore_.collection('users_chat').doc(uid);
      userRef.set({
        chat: false
      },
      { merge: true }
      );
      setChatStatus(false);
      setBeforeChatStatus(false);
      setTime(0);
    },[uid]);

    useEffect(() => {
      const userRef = firestore_.collection('users').doc(yourId);
      userRef.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (data) {
          setYourStatus(data.online);
        }
      });
      if (yourStatus){
        if (!formValue){
          stopChat();
        }
        else if(time>5){
          stopChat();
        }
      }
    },[yourStatus, formValue, time, stopChat]);

    useEffect(() => {
      if (bottomListRef.current) {
        bottomListRef.current.scrollIntoView({ behavior: 'auto' });
      }
    }, [messages]);

    const sendMessage = async (e) => {
      e.preventDefault();
      if(formValue){
        var today = new Date();
        const cur_date = format(today, 'PP', { locale: ko });
        var date_checks = dates_check(cur_date);
    
        if (withoutEmoji(formValue).length === 0) flag = true;
        else flag = false;
        await messagesRef.add({
          text: formValue,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          date_div: date_checks,
          uid,
          isRead: false,
          imageUrl: false,
          isEmoji: flag,
          isReply: false,
          isReplyImg: false,
          react: false,
        });
        setFormValue('');
        if (yourStatus){
          stopChat();
        }
        textarea.current.style.height = 'auto';
      }
    };
  
    const sendImage = (imageUrl, video) => {
  
      var today = new Date();
      const cur_date = format(today, 'PP', { locale: ko });
      var date_checks = dates_check(cur_date);
      var vid = video ? 'video' : 'image';
      messagesRef.add({
        text: vid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        date_div: date_checks,
        uid,
        isRead: false,
        imageUrl: imageUrl,
        isReply: false,
        isReplyImg: false,
        react: false,
      });
    };

    const handleKeyPress = async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e);
        await timeout(1000);
        setBottom(false);
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        setFormValue(formValue+'\n');
      }
    };
  
    const Bottom = async (e) => {
      e.preventDefault();
      bottomListRef.current.scrollIntoView({ behavior: 'smooth' });
      await timeout(1000);
      setBottom(false);
    };
  
    useEffect(() => {
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, []);
  
    const handleScroll = () => {
      setBottom(true);
    };

    const handleChange = (e) => {
      setFormValue(e.target.value);
      textarea.current.style.height = 'auto';
      textarea.current.style.height = textarea.current.scrollHeight + 'px';
      if (textarea.current.scrollHeight>90){
        textarea.current.style.overflow = 'auto';
      }
      else{
        textarea.current.style.overflow = 'hidden';
      }
    };
    const onReload = () =>{
      query = messagesRef.orderBy('createdAt').limitToLast(300);
      if (bottomListRef.current) {
        bottomListRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <>
      {user?
            <OnlineStatus key={uid} userId={yourId} myId={uid} onReload={onReload} />
          :null}
        <main>
        {messages && messages.docs.map(msg => <ChatMessage key={msg.id} message={msg.data()} id={msg.id} date_param={date_check}/>)}
          <span ref={bottomListRef}></span>
        </main>
        <ImageUploader onUpload={sendImage} flag={false} />
        <form>
          <textarea
              className="textarea"
              ref={textarea}
              rows={1}
              value={formValue}
              onInput={()=>checkChatStatus()}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder={'메시지를 입력하세요 ♡'}
            />
          <button onClick={sendMessage} disabled={!formValue}>
            💘
          </button>
        </form>
        {bottom ? (
          <div className='button_b' onClick={Bottom}>
            <img height="25" src={'/icons/bottom.png'} alt="bottom" />
          </div>
        ) : null}
      </>
    );
  }

  async function isReadUpdate(id){
    await firestore.collection('messages_nop').doc(id).update({isRead:true});
  }

const useStyles = makeStyles((theme) => ({
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
    margin: theme.spacing(1),
    '& > *': {
      width: '90%'
    }
  },
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
}));

  function ChatMessage(props) {
    const { text, createdAt, date_div, uid, isRead, imageUrl, isEmoji, isReply, isReplyImg, react, replyId} = props.message;
    const replyRef = useRef(null);
    const id = props.id;
    const formatTime = dates => {
      let formattedDate = format(dates,'a h:mm',{locale: ko});
      return formattedDate;
    };

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    if(isRead === false && uid !== auth.currentUser.uid){
      isReadUpdate(id);
    }

    const onReact_l = async (e)=> {
      await firestore.collection('messages_nop').doc(id).update({react:"👍"});
    }
    const onReact_h = async (e)=> {
      await firestore.collection('messages_nop').doc(id).update({react:"❤️"});
    }
    const onReact_u = async (e)=> {
      await firestore.collection('messages_nop').doc(id).update({react:"😡"});
    }
    const onReact_remove = async (e)=> {
      await firestore.collection('messages_nop').doc(id).update({react:false});
    }

    const onCheckKey = (e) => {
      if(e.key === 'Enter') {
        reply();
      }
      if(e.key === 'Escape'){
        e.preventDefault();
        close();
      }
    }

    const [Ref, hover] = useHover();
    const [open, setOpen] = useState(false);
    const [imageOpen, setImageOpen] = useState(null);
    const [videoOpen, setVideoOpen] = useState(null);
    const [imageModal, setImageModal] = useState(false);

    const [input, setInput] = useState('');
    const classes = useStyles();

    const dates_check = cur_date =>{
      var dates;
      props.date_param.docs.map(date_ch => dates = date_ch.data().createdAt);
      const temp_dates = format(new Date(dates.seconds * 1000), 'PP', {locale: ko});
      if (cur_date !== temp_dates){
        return cur_date;
      }
      else{
        return false;
      }
    }

    const stopChat = () =>{
      const { uid } = auth.currentUser;
      const userRef = firestore_.collection('users_chat').doc(uid);
      userRef.set({
        chat: false
      },
      { merge: true }
      );
    }

    const checkChatStatus = () =>{
      const { uid } = auth.currentUser;
      const userRef = firestore_.collection('users_chat').doc(uid);
      userRef.set({
        chat: true
      },
      { merge: true }
      );
    }

    const reply = async (e) => {
      const { uid } = auth.currentUser;
      let flag;

      var today = new Date();
      const cur_date = format(today,'PP',{locale: ko});
      var date_checks = dates_check(cur_date);

      if (withoutEmoji(input).length===0)
        flag=true;
      else
        flag=false;
      if (flag){
        await firestore.collection('messages_nop').doc(id).update({react:input});
      }
      else{
        await firestore.collection('messages_nop').add({
          text: input,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          date_div:date_checks,
          uid,
          isRead:false,
          imageUrl:false,
          isEmoji:flag,
          isReply:text,
          isReplyImg:imageUrl,
          react:false,
          replyId:id
        })
      }

      setInput('');
      replyModalClose();
    };

    const close = () => {
      setInput('');
      replyModalClose();
    };

    const handleRightClick = e => {
      e.preventDefault();
      firestore.collection('messages_nop').doc(id).update({react:"❤️"});
      // if (window.confirm("삭제할 거예요? 😥")) {
      //   if (uid !== auth.currentUser.uid){
      //     alert("본인 것만 지울 수 있어여 😡");
      //   }
      //   else{
          // firestore.collection('messages_nop').doc(id).delete();
      //     alert("삭제했어여 ❤️‍🩹");
      //   }
      // } else {
      //   alert("취소했어여 ❤️‍🔥");
      // }
    }

    const replyClick = async (img, vid, identifier) => {
      if (identifier===false){
        setImageOpen(img);
        setVideoOpen(vid);
        setImageModal(true);
        return;
      }
      try {
        const element = document.getElementById(identifier);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        await timeout(300);
        element.style.opacity='0.4';
        await timeout(500);
        element.style='';
        await timeout(400);
        element.style.opacity='0.4';
        await timeout(400);
        element.style='';
      }
      catch(error){
        if (img){
          setImageOpen(img);
          setVideoOpen(vid);
          setImageModal(true);
        }
        else return;
      }
    }

    const imageModalClose =() => {
      setImageOpen(null);
      setVideoOpen(null);
      setImageModal(false);
    }

    const imageModalOpen =(img, vid) => {
      setImageOpen(img);
      setVideoOpen(vid);
      setImageModal(true);
    }

    const replyModalClose = () => {
      setOpen(false);
      stopChat();
    }

    const replyModalOpen = () =>{
      setOpen(true);
      checkChatStatus();
    }

    useEffect (()=>{
      if(!replyRef){
        replyRef.current.focus();
      }
    },[replyRef])

    return (<>
    {(date_div!==false)?<>{(date_div!==undefined)? <div className='dates_Div'>{date_div}</div>:null}</>:null}
      <div className={`message ${messageClass}`} ref={Ref} onDoubleClick={handleRightClick}>
        <>
        {(imageUrl)?
        ((text==="image")||!text)?
        <p id={id}>
        <img src={imageUrl} alt="Uploaded" height={"200px"} style={{maxWidth:'180px', cursor:"pointer"}} onClick={()=>imageModalOpen(imageUrl, text)}/></p>:
        <p id={id}> 
        <video controls preload='true' muted height={"250px"} >
        <source src={imageUrl} type={"video/mp4"}/>
        </video>
        </p>
        :<>{isEmoji?
        <>{isReply?
          <p id={id}><div className='reply_p'>
          <div className='reply_' onClick={()=>replyClick(isReplyImg, isReply, replyId)}><>RE:{str}</>{isReply}</div>
          <>{text.split('\n').map((line, index) => (<div key={index}>{line}</div>))}</></div></p>:
          <div className='e'>{text}</div>}</>
        :<p id={id}>{isReply?
        <div className='reply_p'>
          <div className='reply_' onClick={()=>replyClick(isReplyImg, isReply, replyId)}>{isReplyImg?
          <>{(isReply==="image")?
          <><img src={isReplyImg} alt="ReplyImg" height="120" style={{maxWidth:'175px'}}/>
          {(uid === auth.currentUser.uid)?<div className='show_reply' style={{color: 'rgb(255, 255, 255)'}}>Image</div>:<div className='show_reply'>Image</div>}</>:
          <><video preload='true' muted height={"250px"} style={{maxWidth:'175px'}}> <source src={isReplyImg} type={"video/mp4"}/></video>
          {(uid === auth.currentUser.uid)?<div className='show_reply' style={{color: 'rgb(255, 255, 255)'}}>Video</div>:<div className='show_reply'>Video</div>}</>
          }</>
          :<> <>RE:{str}</> {isReply}</>}</div>
          <>{text.split('\n').map((line, index) => (<div key={index}>{line}</div>))}</>
        </div>
        :<>{text.split('\n').map((line, index) => (<div key={index}>{line}</div>))}</>}</p>}
        </>}
        <div className='t'>
        {react?<div className='react' onClick={onReact_remove}>{react}</div>:null}
        <div className='check'>
          {isRead?"ㅤ":1}
        </div>
        {createdAt?.seconds ? (
          <span className="text-gray-500 text-xs">
            {formatTime(new Date(createdAt.seconds * 1000))}
          </span>
        ) : null}
        </div>
        {hover?
          <div className={`${messageClass}buttons`}>
          <div className='button-row'>
            <div className='button_react' hidden ref={Ref} onClick={onReact_l}>
              👍
            </div>  
            <div className='button_react' hidden ref={Ref} onClick={onReact_h}>
              ❤️
            </div>
            <div className='button_react' hidden ref={Ref} onClick={onReact_u}>
              😡
            </div>
          </div>
          <div className='button_r' hidden ref={Ref} onClick={(e) => replyModalOpen()}>
            <img height="22" src={'/icons/reply.png'} alt="reply"/>
          </div>
        </div>
       :null}  
       </>
      </div>

      <Modal open={open} onClose={(e) => replyModalClose()} onKeyDown ={onCheckKey}>
        <div className={classes.reply} >
          <div className='text'>Reply 💘</div>
          <div className={"reply_text"}>↪️ {text}</div>
          <div className={classes.formControl}>
            <Input
              placeholder="답장하슈 ♡"
              value={input}
              ref={replyRef}
              style={{ fontFamily: "TheJamsil2Light"}}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
          <div className='reply_buttons'>
            <Button onClick={(e) => reply()} style={{ fontFamily: "TheJamsil2Light"}}> reply</Button>
            <Button onClick={(e) => close()} style={{ fontFamily: "TheJamsil2Light"}}> close</Button>
          </div>
        </div>
        </Modal>
        <Modal
         open={imageModal} onClose={(e) => imageModalClose()}>
         <div className={classes.ImagePopUp} >
            <button style={{position:'fixed', top:"0", right:"0", backgroundColor:"#ffffff00"}} onClick={()=>imageModalClose()}>✖️</button>
            {(videoOpen==="video")?
            <video controls muted height={"250px"}>
            <source src={imageOpen}></source>
            </video>:
            <img className={classes.img} src={imageOpen} alt="Preview" style={{maxHeight:'500px'}}/>}
         </div>
        </Modal>
      </>
    )
  };

  export default ChatPage;