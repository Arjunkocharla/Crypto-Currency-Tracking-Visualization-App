/* all frontend code is written by team mate niharika chundury, i did help in error resolution of code */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from "./components/Home";
import Analysis from "./components/Analysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/Analysis" element={<Analysis/>} />
      </Routes>
    </Router>
  );
}

export default App;