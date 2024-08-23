import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Archivo CSS personalizado
import { FaShoppingCart } from 'react-icons/fa';
import cartIcon from './icons/cart-shopping-solid.svg';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [view, setView] = useState('home');

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/nutritionix?query=${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al buscar alimentos');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error in handleSearch:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (input) => {
    if (!input) return;

    try {
      const response = await fetch(`http://localhost:5000/api/nutritionix?query=${input}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener sugerencias');
      }
      const data = await response.json();
      setSuggestions(data.map(item => item.item_name));
    } catch (error) {
      console.error('Error in fetchSuggestions:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    fetchSuggestions(input);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    handleSearch();
  };

  const renderSuggestions = () => {
    return (
      <div style={styles.suggestionContainer}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            style={styles.suggestionItem}
          >
            {suggestion}
          </div>
        ))}
      </div>
    );
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const addToCart = (item) => {
    const newItem = { ...item, id: item.tag_id || item.nix_item_id || `${item.food_name}-${Math.random()}` };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const renderCart = () => {
    return (
      <Container className="mt-5">
        <Row>
          <Col>
            <h2 style={styles.cartTitle}>Carrito de Compras</h2>
            {cart.length > 0 ? (
              <ul style={styles.cartList}>
                {cart.map((item, index) => (
                  <li key={index} style={styles.cartItem}>
                    <img src={item.photo_url || "https://example.com/default-image.jpg"} alt={item.item_name} style={styles.cartItemImage} />
                    <div>
                      <strong>{item.item_name}</strong><br />
                      {item.nf_calories ? `${item.nf_calories} kcal` : 'N/A'} kcal
                    </div>
                    <Button variant="danger" onClick={() => removeFromCart(item.id)} style={styles.removeButton}>Eliminar</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center" style={styles.emptyCart}>El carrito está vacío</p>
            )}
            <Button variant="primary" className="mt-4" onClick={() => setView('home')} style={styles.backButton}>
              Volver a la Tienda
            </Button>
          </Col>
        </Row>
      </Container>
    );
  };

  const renderHome = () => {
    return (
      <Container className="mt-5">
        <Row className="justify-content-md-center">
          <Col md={8}>
            <Button variant="secondary" className="mb-4" onClick={() => setView('cart')} style={styles.cartButton}>
              <img src={cartIcon} alt="Cart" style={styles.cartIcon} /> Abrir Carrito
            </Button>
            <Form className="mb-4">
              <InputGroup>
                <Form.Control
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Buscar alimento..."
                  onKeyPress={handleKeyPress}
                  style={styles.searchInput}
                />
                <Button variant="primary" onClick={handleSearch} style={styles.searchButton}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Buscar'}
                </Button>
              </InputGroup>
              {suggestions.length > 0 && renderSuggestions()}
            </Form>
            <Row>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <Col md={4} key={index} className="mb-4">
                    <Card style={styles.card}>
                      <div style={styles.imageContainer}>
                        <Card.Img
                          variant="top"
                          src={result.photo_url || "https://example.com/default-image.jpg"}
                          alt={result.item_name}
                          style={styles.cardImage}
                        />
                      </div>
                      <Card.Body style={styles.cardBody}>
                        <Card.Title style={styles.cardTitle}>{result.item_name}</Card.Title>
                        <Card.Text style={styles.cardText}>
                          <strong>Marca:</strong> {result.brand_name || "Información no disponible"} <br />
                          <strong>Porción:</strong> {result.nf_serving_size_qty} {result.nf_serving_size_unit} <br />
                          {result.nf_calories && <span><strong>Calorías:</strong> {result.nf_calories} kcal</span>} <br />
                          {result.brand_name && <span><strong>Tipo:</strong> Alimento de marca</span>}
                          {!result.brand_name && <span><strong>Tipo:</strong> Alimento común</span>}
                        </Card.Text>
                        <Button variant="success" onClick={() => addToCart(result)} style={styles.addButton}>
                          Añadir al Carrito
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                !loading && <p className="text-center" style={styles.noResults}>No se encontraron resultados</p>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    );
  };

  return view === 'home' ? renderHome() : renderCart();
}

const styles = {
  card: {
    height: '100%',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  cardImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain', // Mantén la imagen sin recortes, centrada y ajustada dentro del contenedor
    margin: 'auto', // Centra la imagen dentro del contenedor
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#343a40',
  },
  cardText: {
    fontSize: '0.9rem',
    color: '#6c757d',
  },
  addButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
    borderRadius: '20px',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#218838',
    },
  },
  imageContainer: {
    height: '300px', // Ajusta la altura del contenedor de la imagen
    display: 'flex', // Utiliza Flexbox para centrar la imagen
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #ccc',
  },
  searchInput: {
    borderRadius: '20px 0 0 20px',
    padding: '10px 20px',
    fontSize: '1rem',
  },
  searchButton: {
    borderRadius: '0 20px 20px 0',
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  cartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    color: '#fff',
    borderRadius: '20px',
    ':hover': {
      backgroundColor: '#0069d9',
    },
  },
  cartIcon: {
    width: '20px',
    height: '20px',
    marginRight: '10px',
  },
  suggestionContainer: {
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: '2px',
    maxWidth: '300px',
  },
  suggestionItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  cartTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#343a40',
  },
  cartList: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  cartItem: {
    fontSize: '1rem',
    color: '#343a40',
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    marginRight: '10px',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    borderRadius: '20px',
    padding: '5px 10px',
    fontSize: '0.8rem',
    ':hover': {
      backgroundColor: '#c82333',
    },
  },
  backButton: {
    display: 'block',
    margin: '0 auto',
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    borderRadius: '20px',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 'bold',
    ':hover': {
      backgroundColor: '#0069d9',
    },
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6c757d',
  },
  noResults: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6c757d',
  },
};

export default App;
