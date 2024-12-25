import React, { useEffect, useState } from 'react';
import { fetchRestaurants, fetchMySubscriptions, calculateTotalPrice, placeOrder } from './api';
import { Container, Accordion, Card, Spinner, Alert, Button, Form } from 'react-bootstrap';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [mentions, setMentions] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [totalData, setTotalData] = useState({ productsPrice: 0, transportPrice: 0, totalPrice: 0 }); 

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const loadUserSubscription = async () => {
      try {
        const subscriptionData = await fetchMySubscriptions();
        setUserSubscription(subscriptionData.find((sub) => sub.isActive));
      } catch (err) {
        setError(err.message);
      }
    };

    loadRestaurants();
    loadUserSubscription();
  }, []);

  const updateTotal = async (cart) => {
    const orderItems = cart.map((item) => ({
      productId: item.id,
      productQuantity: item.quantity,
    }));

    try {
      const totalResponse = await calculateTotalPrice(orderItems);
      setTotalData(totalResponse);
    } catch (err) {
      console.error('Error updating total:', err);
    }
  };

  const handleAddToCart = (menuItem, quantity) => {
    if (quantity > 0) {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === menuItem.id);
        if (existingItem) {
          const updatedCart = prevCart.map((item) =>
            item.id === menuItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          updateTotal(updatedCart); 
          return updatedCart;
        }

        const updatedCart = [...prevCart, { ...menuItem, quantity }];
        updateTotal(updatedCart);
        return updatedCart;
      });
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== itemId);
      updateTotal(updatedCart); 
      return updatedCart;
    });
  };

  const handlePlaceOrder = async () => {
    const orderPayload = {
      mentions,
      orderItems: cart.map((item) => ({
        productId: item.id,
        productQuantity: item.quantity,
      })),
    };

    try {
      await placeOrder(orderPayload);
      alert('Order placed successfully!');
      setCart([]);
      setMentions('');
      setTotalData({ productsPrice: 0, transportPrice: 0, totalPrice: 0 }); 
    } catch (err) {
      alert('An error occurred while placing the order.');
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h2>Restaurants</h2>
      <Accordion defaultActiveKey="0">
        {restaurants.map((restaurant, index) => (
          <Accordion.Item eventKey={index.toString()} key={restaurant.restaurantDto.id}>
            <Accordion.Header>{restaurant.restaurantDto.name}</Accordion.Header>
            <Accordion.Body>
              {restaurant.menuDtos.map((menu) => (
                <Card key={menu.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>{menu.name}</Card.Title>
                    <Card.Text>Price: {menu.price} Lei</Card.Text>
                    <Card.Text>Availability: {menu.isAvailable ? 'Available' : 'Unavailable'}</Card.Text>
                    <Card.Text>
                      Ingredients: {menu.ingredients.length > 0
                        ? menu.ingredients.map((ing) => ing.name).join(', ')
                        : 'N/A'}
                    </Card.Text>
                    {menu.isAvailable && (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const quantity = parseInt(e.target.elements.quantity.value, 10);
                          handleAddToCart(menu, quantity);
                          e.target.reset();
                        }}
                      >
                        <Form.Group controlId={`quantity-${menu.id}`} className="d-flex align-items-center">
                          <Form.Label className="me-2 mb-0">Quantity:</Form.Label>
                          <Form.Control
                            type="number"
                            name="quantity"
                            defaultValue={0}
                            min={0}
                            max={100}
                            style={{ width: '80px' }}
                          />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="mt-2">
                          Add to cart
                        </Button>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <h3 className="mt-5">Shopping Cart</h3>
      {cart.length === 0 ? (
        <Alert variant="info">The cart is empty.</Alert>
      ) : (
        <div>
          {cart.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>Price: {item.price} Lei</Card.Text>
                <Card.Text>Quantity: {item.quantity}</Card.Text>
                <Button variant="danger" onClick={() => handleRemoveFromCart(item.id)}>Remove</Button>
              </Card.Body>
            </Card>
          ))}

          <Form.Group controlId="mentions" className="mt-4">
            <Form.Label>Notes:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={mentions}
              onChange={(e) => setMentions(e.target.value)}
              placeholder="Add notes for your order"
            />
          </Form.Group>

          <Alert variant="info" className="mt-3">
            <p>Products price: {totalData.productsPrice.toFixed(2)} Lei</p>
            <p>Transport price: {totalData.transportPrice.toFixed(2)} Lei</p>
            <p>Total price: {totalData.totalPrice.toFixed(2)} Lei</p>
          </Alert>

          <Button variant="success" className="mt-3" onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Restaurants;
