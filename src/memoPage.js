import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import "./Memo.css";
import MemoList from "./Memo";
import { firestore, auth } from './firebase'
import firebase from 'firebase/compat/app';

import { useCollection } from 'react-firebase-hooks/firestore';
import { Button, FormControl, InputLabel, Input } from "@material-ui/core";

export function MemoPage() {
  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)

  const [input, setInput] = useState("");
  const messagesRef = firestore.collection('Memos');
  const query = messagesRef.orderBy('createdAt','desc');

  const [texts] = useCollection(query, { idField: 'id' });

  const topListRef = useRef();

  useEffect(() => {
    if (topListRef.current) {
      topListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesRef]);

  const addMemo = async(e) => {
    e.preventDefault();
    const displayName  = auth.currentUser.displayName;
    await messagesRef.add({
      Memo: input,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName: displayName
    });
    setInput("");
    topListRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const [marginTop, setMarginTop] = useState(40);

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
  
    return (<>
        <header style={{ paddingLeft: "10px", paddingRight: "15px"}}>
            <Link to="/">
            <div className='button_back'>⏪</div>
            </Link>
            <div className='m' style={{ fontWeight: "bold", fontSize: "1.1rem"}}>MEMO</div>
        </header>
        <div className='main_memo'>
              {texts && texts.docs.map(memos => <MemoList key={memos.id} memo={memos.data()} id={memos.id}/>)}
        </div>
        <form className="appInput" onSubmit={addMemo} >
          <FormControl
              fullWidth="true">
            <InputLabel
            color="error"
            disableTypography
            style={{ fontFamily: "TheJamsil2Light"}}
            >
            메모를 입력하세요 ♡
            </InputLabel>
            <Input
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
              }}
            />
          </FormControl>
          <div className="add-button">
            <Button
              disabled={!input}
              type="submit"
              onClick={addMemo}
              variant="contained"
              color="primary"
              fontFamily="TheJamsil2Light"
            >
              ➕
            </Button>
          </div>
        </form></>
    );
}

export default MemoPage;
