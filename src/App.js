import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MemoPage } from './memoPage';
import { ChatPage } from './chatPage';
import { Calendarpage } from './calendarPage';
import { Albumpage } from './albumPage';
import './App.css';

function App() {
  const meta = document.createElement('meta')
  meta.name = 'google'
  meta.content = 'notranslate'
  document.getElementsByTagName('head')[0].appendChild(meta)
  
  return (
  <div className="App">
   <BrowserRouter>
        <Routes>
          <Route element={<ChatPage/>} path="/" exact  />
          <Route element={<MemoPage/>} path="/memo" exact />
          <Route element={<Calendarpage/>} path="/calendar" exact />
          <Route element={<Albumpage/>} path="/album" exact />
        </Routes>
   </BrowserRouter>
  </div>
  );
}

export default App;
