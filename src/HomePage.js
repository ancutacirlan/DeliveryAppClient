import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Alert, Button } from 'react-bootstrap';
import Restaurants from './Restaurants';
import Subscriptions from './Subscriptions';
import MySubscriptions from './MySubscriptions';
import { fetchMySubscriptions } from './api';

const HomePage = () => {
  const [key, setKey] = useState('restaurants'); 
  const [alertMessage, setAlertMessage] = useState(null); 
  const [subscriptions, setSubscriptions] = useState([]);

  const formatSubscriptionName = (name) => {
    return name.replace(/_/g, ' '); 
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const expirationDate = new Date(endDate);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0; 
  };

  const hasActiveSubscription = (subscriptions, expiringSubscription) => {
    return subscriptions.some((subscription) => {
      const isActive = new Date(subscription.endDate).getTime() > new Date().getTime();
      return isActive && subscription.id !== expiringSubscription?.id; 
    });
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await fetchMySubscriptions();
        setSubscriptions(data);

        const expiringSubscription = data.find((subscription) => isExpiringSoon(subscription.endDate));

        if (expiringSubscription && !hasActiveSubscription(data, expiringSubscription)) {
          setAlertMessage(
            <Alert variant="warning" className="d-flex justify-content-between align-items-center">
              <span>The subscription "{formatSubscriptionName(expiringSubscription.subscription)}" is about to expire!</span>
              <Button variant="link" onClick={() => setKey('mySubscriptions')}>Renew</Button>
            </Alert>
          );
        } else {
          setAlertMessage(null);
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      }
    };

    loadSubscriptions();
  }, []); 

  return (
    <Container>
      <h1 className="text-center my-4">Delivery App</h1>

      {alertMessage && <div className="mb-3">{alertMessage}</div>}

      <Tabs
        id="homepage-tabs"
        activeKey={key} 
        onSelect={(k) => setKey(k)} 
        className="mb-3"
      >
        <Tab eventKey="restaurants" title="Restaurants">
          <Restaurants />
        </Tab>
        <Tab eventKey="subscriptions" title="Subscriptions">
          <Subscriptions />
        </Tab>
        <Tab eventKey="mySubscriptions" title="My Subscriptions">
          <MySubscriptions />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default HomePage;
