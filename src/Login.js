import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';
import { Form, Button, Container, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="my-5">
      {/* Adaugă titlul aplicației */}
      <h1 className="text-center mb-4">Delivery App</h1>
      <h2>Logare</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Introdu email-ul"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Parolă</Form.Label>
          <Form.Control
            type="password"
            placeholder="Introdu parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Logare
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
