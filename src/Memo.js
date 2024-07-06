import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    List,
    ListItem,
    ListItemText,
    Button,
    Modal,
    Input,
  } from "@material-ui/core";

import "./Memo.css";
import 'firebase/compat/firestore';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/firestore';
// import 'firebase/compat/auth';
// import "firebase/compat/storage"
import { format } from 'date-fns';
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { firestore } from './firebase';

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "100vw",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    fontFamily: 'TheJamsil2Light'
  },
  listItemText: {
    fontFamily: 'TheJamsil2Light',
    textAlign: 'left'
  },
  formControl: {
    display: 'block',
    margin: theme.spacing(1),
    '& > *': {
      width: '70%'
    }
  },
}));

export function MemoList(props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState();
  const classes = useStyles();

  const {Memo, createdAt, displayName} = props.memo;
  const id = props.id;

  const updateMemo = () => {
    firestore.collection("Memos").doc(id).set(
      {
        Memo: input,
      },
      { merge: true }
    );
    setOpen(false);
  };
  let second ='';
  if (createdAt!==null)
    second = format(createdAt.seconds*1000, "yy/MM/dd HH:mm") +"❣️"+ displayName.split('(')[0]

  return (
    <>
      <Modal open={open} onClose={(e) => setOpen(false)}>
        <div className={classes.paper}>
          <h1>fix it!</h1>
          <Input
            disableTypography
            placeholder={Memo}
            value={input}
            style={{ fontFamily: "TheJamsil2Light"}}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button onClick={(e) => updateMemo()}>update</Button>
        </div>
      </Modal>

      <List className="Memolist-entry">
        <ListItem className="Memo-inputbox">
          <ListItemText
            classes={{primary:classes.listItemText, secondary:classes.listItemText}}
            primary={Memo}
            secondary= {second}
          ></ListItemText>
        </ListItem>
        <Button size="small" className="update-button" onClick={(e) => setOpen(true)}>
          수정
        </Button>
        <div className="delete-button">
          <DeleteForeverIcon size="small"
            onClick={(event) =>
              firestore.collection("Memos").doc(id).delete()
            }
          />
        </div>
      </List>
    </>
  );
}

export default MemoList;