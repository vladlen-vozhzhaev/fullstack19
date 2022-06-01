import logo from './logo.svg';
import './App.css';
import {Menu} from "./components/Menu";
import {Header} from "./components/Header";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Posts} from "./components/Posts";
import {Footer} from "./components/Footer";
import {SinglePost} from "./components/SinglePost";

function App() {
  return (
      <BrowserRouter>
          <Menu/>
          <Header/>
          <Routes>
              <Route path="/" element={<Posts/>}/>
              <Route path="/article/:id" element={<SinglePost/>}/>
          </Routes>
          <Footer/>
      </BrowserRouter>
  );
}

export default App;