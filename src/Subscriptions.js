import React, { useState, useEffect } from 'react';
import { fetchSubscriptions, fetchMySubscriptions, renewSubscription } from './api';
import { Card, Container, Spinner, Alert, Button } from 'react-bootstrap';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]); 
  const [mySubscriptions, setMySubscriptions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasActivePremiumOrGold, setHasActivePremiumOrGold] = useState(false); 

  const formatSubscriptionName = (name) => {
    return name.replace(/_/g, ' ');
  };

  const handlePurchaseSubscription = async (subscriptionId) => {
    const renewalPayload = {
      subscriptionId: subscriptionId,
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
        .toISOString()
        .split('T')[0],
    };

    try {
      await renewSubscription(renewalPayload); 
      alert('Subscription purchased successfully!');
      window.location.reload();

    } catch (error) {
      alert('An error occurred while purchasing the subscription.');
    }
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        console.log("Fetching available subscriptions...");
        const data = await fetchSubscriptions(); 
        console.log("Available subscriptions:", data);
        setSubscriptions(data);
      } catch (err) {
        setError(`Error fetching subscriptions: ${err.message}`);
        console.error("Error fetching available subscriptions:", err);
      }
    };

    const loadMySubscriptions = async () => {
      try {
        console.log("Fetching my subscriptions...");
        const myData = await fetchMySubscriptions(); 
        console.log("My subscriptions:", myData);
        setMySubscriptions(myData);

        const activePremiumOrGold = myData.some(
          (subscription) =>
            (subscription.subscription === 'PREMIUM_PLAN' || subscription.subscription === 'GOLD_PLAN') &&
            new Date(subscription.endDate) > new Date() 
        );
        console.log("Has active PREMIUM or GOLD subscription:", activePremiumOrGold);
        setHasActivePremiumOrGold(activePremiumOrGold);
      } catch (err) {
        setError(`Error fetching my subscriptions: ${err.message}`);
        console.error("Error fetching my subscriptions:", err);
      } finally {
        setLoading(false); 
      }
    };

    loadSubscriptions();
    loadMySubscriptions();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h2>Available Subscriptions</h2>
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="mb-3">
          <Card.Body>
            <Card.Title>{formatSubscriptionName(subscription.name)}</Card.Title>
            <Card.Text>{subscription.description}</Card.Text>
            <Card.Text>Price: {subscription.price} Lei</Card.Text>
            <Card.Text>Type: {subscription.typeSubscription}</Card.Text>

            {(subscription.typeSubscription === 'ANNUAL' || subscription.typeSubscription === 'MONTHLY') && (
              <Button
                variant="primary"
                onClick={() => handlePurchaseSubscription(subscription.id)}
                disabled={
                  hasActivePremiumOrGold && 
                  (subscription.name === 'PREMIUM_PLAN' || subscription.name === 'GOLD_PLAN')
                }
              >
                Purchase Subscription
              </Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default Subscriptions;
