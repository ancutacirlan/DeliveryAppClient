import React, { useEffect, useState } from 'react';
import { fetchMySubscriptions, renewSubscription, deleteSubscription } from './api'; 
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import './MySubscriptions.css'; 

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatSubscriptionName = (name) => {
    return name.replace(/_/g, ' ');
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await fetchMySubscriptions();
        setSubscriptions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const handleRenewSubscription = async (subscription) => {
    const startDate = new Date(subscription.endDate);
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    if (subscription.subscription === 'GOLD_PLAN') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const renewalPayload = {
      subscriptionId: subscription.subscriptionId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    try {
      await renewSubscription(renewalPayload);
      alert('Abonamentul a fost reînnoit cu succes!');
      window.location.reload();

      const data = await fetchMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      alert('A apărut o eroare la reînnoirea abonamentului.');
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await deleteSubscription(id);
      alert('Abonamentul a fost șters cu succes!');
      window.location.reload();

      const data = await fetchMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      alert('A apărut o eroare la ștergerea abonamentului.');
    }
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const expirationDate = new Date(endDate);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 3 && diffDays >= 0; 
  };

  const hasActiveSubscriptionOfSameType = (currentSubscription) => {
    return subscriptions.some((sub) => {
      const isSameType = sub.subscription === currentSubscription.subscription;
      const isActive = new Date(sub.endDate) > new Date();
      const isDifferent = sub.id !== currentSubscription.id; 
      return isSameType && isActive && isDifferent;
    });
  };

  const isSingleActiveSubscription = () => {
    const activeSubscriptions = subscriptions.filter((sub) => new Date(sub.endDate) > new Date());
    return activeSubscriptions.length === 1 && !isExpiringSoon(activeSubscriptions[0].endDate);
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h2>Abonamentele mele</h2>
      {subscriptions.length === 0 ? (
        <Alert variant="info">Nu ai niciun abonament activ.</Alert>
      ) : (
        subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="mb-3"
            style={isExpiringSoon(subscription.endDate) ? { border: '2px solid red' } : {}}
          >
            <Card.Body>
              
              <Card.Title>{formatSubscriptionName(subscription.subscription)}</Card.Title>
              <Card.Text>Data începerii: {new Date(subscription.startDate).toLocaleDateString()}</Card.Text>
              <Card.Text>Data expirării: {new Date(subscription.endDate).toLocaleDateString()}</Card.Text>

              <Button
                variant="primary"
                onClick={() => handleRenewSubscription(subscription)}
                className="me-2"
                disabled={hasActiveSubscriptionOfSameType(subscription) || isSingleActiveSubscription()}
              >
                Reînnoiește abonamentul
              </Button>

              <Button
                variant="danger"
                onClick={() => handleDeleteSubscription(subscription.id)}
              >
                Șterge abonamentul
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default MySubscriptions;

