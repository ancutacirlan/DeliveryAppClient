import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './api';
import { Form, Button, Container, Alert } from 'react-bootstrap';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, address);
      navigate.push('/login'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="my-5">
      <h2>Înregistrare</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleRegister}>
        <Form.Group controlId="formName">
          <Form.Label>Nume</Form.Label>
          <Form.Control
            type="text"
            placeholder="Introdu numele"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
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
        <Form.Group controlId="formAddress">
          <Form.Label>Adresă</Form.Label>
          <Form.Control
            type="text"
            placeholder="Introdu adresa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Înregistrează-te
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
