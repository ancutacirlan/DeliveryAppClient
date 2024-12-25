import React from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import HomePage from './HomePage';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
            </Routes>
    </Router>
  );
};

export default App;
