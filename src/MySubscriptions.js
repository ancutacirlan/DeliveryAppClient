// MySubscriptions.js
import React, { useEffect, useState } from 'react';
import { fetchMySubscriptions, renewSubscription, deleteSubscription, setSubscriptionToExpire } from './api'; 
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
      alert('The subscription has been successfully renewed!');
      window.location.reload();

      const data = await fetchMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      alert('An error occurred while renewing the subscription.');
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await deleteSubscription(id);
      alert('The subscription has been successfully deleted!');
      window.location.reload();

      const data = await fetchMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      alert('An error occurred while deleting the subscription.');
    }
  };

  const handleSetToExpire = async (id) => {
    try {
      await setSubscriptionToExpire(id);
      alert('The subscription has been successfully set to expire!');
      const data = await fetchMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      alert('An error occurred while setting the subscription to expire.');
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
      <h2>My Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <Alert variant="info">You have no active subscriptions.</Alert>
      ) : (
        subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="mb-3"
            style={isExpiringSoon(subscription.endDate) ? { border: '2px solid red' } : {}}
          >
            <Card.Body>
              <Card.Title>{formatSubscriptionName(subscription.subscription)}</Card.Title>
              <Card.Text>Start Date: {new Date(subscription.startDate).toLocaleDateString()}</Card.Text>
              <Card.Text>End Date: {new Date(subscription.endDate).toLocaleDateString()}</Card.Text>

              <Button
                variant="primary"
                onClick={() => handleRenewSubscription(subscription)}
                className="me-2"
                disabled={hasActiveSubscriptionOfSameType(subscription) || isSingleActiveSubscription()}
              >
                Renew Subscription
              </Button>

              <Button
                variant="danger"
                onClick={() => handleDeleteSubscription(subscription.id)}
                className="me-2"
              >
                Delete Subscription
              </Button>

              <Button
                variant="warning"
                onClick={() => handleSetToExpire(subscription.id)}
              >
                Set to Expire
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default MySubscriptions;