import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import { firestore, auth } from './firebase'
import firebase from 'firebase/compat/app';

import 'react-contexify/ReactContexify.css';

import {
  Button,
  Modal,
  Input,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { useCollection } from 'react-firebase-hooks/firestore';

const apiKey = process.env.REACT_APP_GOOGLE_CALENDAR_KEY;

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
    // display: 'block',
    margin: theme.spacing(1),
    '& > *': {
      width: '90%'
    }
  },
}));


export function Calendarpage() {
  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)
  
  const EventRef = firestore.collection('calendar');

  const onCheckKey = (e) => {
    if(e.key === 'Enter') {
      add();
    }
    if(e.key === 'Escape'){
      e.preventDefault();
      close();
    }
  }

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(null);
  const [dates, setDates] = useState(null);
  const classes = useStyles();

  const query = EventRef.orderBy('id').limitToLast(50);
  const [EVENTS] = useCollection(query, { idField: 'id' });

  const close = () => {
    setInput('');
    setDates('');
    setOpen(false);
  };

  let EVENTS_list='';
  if (EVENTS !== undefined){
    EVENTS_list = EVENTS.docs.map((val) => {
      return {
        title: val.data().title,
        date: val.data().date,
        publicId: val.data().id,
        color: (val.data().uid==="Z7mCYAOqVnYl1xPaG1ezgwECQ0D3")? '#ff4ecd' : '#016ebc',
      };
    });

  } 
  let uid ='';
  if (auth.currentUser !== null){
    uid = auth.currentUser.uid;
  }

  const add = async (e) => {
    await EventRef.add({
      id: firebase.firestore.FieldValue.serverTimestamp(),
      title:input,
      date:dates,
      uid:uid
    })
    setInput('');
    setDates('');
    setOpen(false);
  };

  return (
    <>
    <header style={{ paddingLeft: "10px", paddingRight: "15px"}}>
      <Link to="/">
      <div className='button_back'>⏪</div>
      </Link>
      <div className='m' style={{ fontWeight: "bold" , fontSize: "1.1rem"}}>CALENDAR</div>
    </header>
    <div className="cal-container">
      <FullCalendar
        plugins={[dayGridPlugin, googleCalendarPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        googleCalendarApiKey={apiKey}
        eventSources={[
            {
                googleCalendarId:'ko.south_korea#holiday@group.v.calendar.google.com',
                className: 'holiday',
                textColor: '#FFF',
                color:'#125800'
            }
        ]}
        eventDisplay={'block'}
        eventClick={function(info){

        }}
        height= {'70vh'}
        dateClick={function(info){
          setDates(info.dateStr);
          setOpen(true);
        }}
        events={EVENTS_list}
      />
    </div>
    <Modal open={open} onClose={(e) => setOpen(false)} onKeyDown ={onCheckKey}>
      <div className={classes.reply} >
        <text>Event 💘</text>
        {uid==="Z7mCYAOqVnYl1xPaG1ezgwECQ0D3"? 
        <div className={classes.reply_text}> 현정 ➕ {dates}</div>:
        <div className={classes.reply_text}> 준형 ➕ {dates}</div>}
        <div className={classes.formControl}>
          <Input
            disableTypography
            placeholder="일정을 입력하슈 ♡"
            value={input}
            style={{ fontFamily: "TheJamsil2Light"}}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className='reply_buttons'>
          <Button onClick={(e) => add()} style={{ fontFamily: "TheJamsil2Light"}}> add</Button>
          <Button onClick={(e) => close()} style={{ fontFamily: "TheJamsil2Light"}}> close</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}

export default Calendarpage;