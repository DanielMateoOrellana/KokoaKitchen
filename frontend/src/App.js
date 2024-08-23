import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner, Collapse } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import cartIcon from './icons/cart-shopping-solid.svg';
import kokoaNutrition from './images/kokoa_nutrition.png';
import logoNutritionix from './images/logo_nutritionix.png';

function App() {
  const [query, setQuery] = useState(''); // Almacena la cadena de búsqueda que ingresa el usuario
  const [results, setResults] = useState([]); // Almacena los resultados de búsqueda obtenidos desde la API
  const [loading, setLoading] = useState(false); // Controla el estado de carga mientras se realiza una búsqueda.
  const [cart, setCart] = useState([]); // Almacena los elementos que el usuario ha agregado al carrito
  const [suggestions, setSuggestions] = useState([]); // Almacena las sugerencias de búsqueda que se muestran mientras el usuario escribe
  const [view, setView] = useState('home'); // Controla la vista actual (página principal o carrito de compras)
  const [openCardIndex, setOpenCardIndex] = useState(null); // Almacena el índice de la tarjeta que está expandida para mostrar detalles adicionales
  const [filteredResults, setFilteredResults] = useState([]); // Almacena los resultados filtrados basados en la imagen
  const [filter, setFilter] = useState('all'); // Controla qué tipo de resultados se están mostrando ("todos", "con imagen", "sin imagen")

  useEffect(() => { // useEffect para cargar el carrito desde localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  useEffect(() => { // useEffect para guardar el carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => { // useEffect para aplicar filtros
    filterResults();
  }, [filter, results]);

// Realiza una llamada a la API para buscar alimentos según el término de búsqueda (query). 
// Los resultados obtenidos se almacenan en el estado results, y se restablece el filtro a "todos"

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
      setFilter('all');
    } catch (error) {
      console.error('Error in handleSearch:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Busca sugerencias de búsqueda a medida que el usuario escribe. 
  // Muestra una lista de sugerencias basada en la entrada actual
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

  // Actualiza la cadena de búsqueda (query) 
  // y busca sugerencias basadas en la nueva entrada
  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    fetchSuggestions(input);
  };

  // Establece la sugerencia seleccionada como la 
  // nueva consulta y ejecuta la búsqueda
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

  // Permite buscar al presionar la tecla Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  // Agrega un elemento al carrito, generando 
  // un identificador único si es necesario
  const addToCart = (item) => {
    const newItem = { ...item, id: item.tag_id || item.nix_item_id || `${item.food_name}-${Math.random()}` };
    setCart([...cart, newItem]);
  };

  // Elimina un elemento del carrito
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Alterna la expansión o contracción de una tarjeta 
  // de producto para mostrar u ocultar los detalles
  const toggleCardDetails = (index) => {
    setOpenCardIndex(openCardIndex === index ? null : index);
  };

  // Filtra los resultados de búsqueda en función de si tienen 
  // una imagen o no, según el filtro seleccionado
  const filterResults = () => {
    if (filter === 'withImage') {
      setFilteredResults(results.filter(item => item.photo_url && item.photo_url !== "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png"));
    } else if (filter === 'withoutImage') {
      setFilteredResults(results.filter(item => item.photo_url === "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png"));
    } else {
      setFilteredResults(results);
    }
  };

  const renderCart = () => {
    return (
      <Container className="mt-5">
        <Row className="justify-content-md-center">
          <Col md={12} className="d-flex justify-content-center mb-4">
            <img src={kokoaNutrition} alt="Kokoa Nutrition" style={styles.mainLogo} />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={8} className="text-center">
            <h2 style={styles.cartTitle}>Carrito de Compras</h2>
            {cart.length > 0 ? (
              <ul style={styles.cartList}>
                {cart.map((item, index) => (
                  <li key={index} style={styles.cartItem}>
                    <img src={item.photo_url} alt={item.item_name} style={styles.cartItemImage} />
                    <div>
                      <strong style={{ color: '#ffffff' }}>{item.item_name}</strong><br />
                      <span style={{ color: '#ffffff' }}>
                        {item.nf_calories ? `${item.nf_calories} kcal` : ''}
                      </span>
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
        <Row className="justify-content-md-center mt-5">
          <Col md={8} className="text-center">
            <img src={logoNutritionix} alt="Logo Nutritionix" style={styles.bottomLogo} />
            <p style={styles.creditText}>Créditos a Nutritionix</p>
          </Col>
        </Row>
      </Container>
    );
  };

  const renderHome = () => {
    return (
      <Container className="mt-5">
        <Row className="justify-content-md-center">
          <Col md={12} className="d-flex justify-content-center mb-4">
            <img src={kokoaNutrition} alt="Kokoa Nutrition" style={styles.mainLogo} />
          </Col>
        </Row>
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
            <div style={styles.filterContainer}>
              <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')} style={styles.filterButton}>
                Todos
              </Button>
              <Button variant={filter === 'withImage' ? 'primary' : 'secondary'} onClick={() => setFilter('withImage')} style={styles.filterButton}>
                Con Imagen
              </Button>
              <Button variant={filter === 'withoutImage' ? 'primary' : 'secondary'} onClick={() => setFilter('withoutImage')} style={styles.filterButton}>
                Sin Imagen
              </Button>
            </div>
            <Row>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <Col md={4} key={index} className="mb-4">
                    <Card
                      style={{
                        ...styles.card,
                        transform: openCardIndex === index ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: openCardIndex === index ? '0 8px 16px rgba(255, 255, 255, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={() => toggleCardDetails(index)}
                    >
                      <div style={styles.imageContainer}>
                        <Card.Img
                          variant="top"
                          src={result.photo_url}
                          alt={result.item_name}
                          style={styles.cardImage}
                        />
                      </div>
                      <Card.Body style={styles.cardBody}>
                        <Card.Title style={styles.cardTitle}>{result.item_name}</Card.Title>
                      </Card.Body>
                      <Collapse in={openCardIndex === index}>
                        <div style={styles.cardDetails}>
                          <ul>
                            <li><strong>Porción:</strong> {result.nf_serving_size_qty} {result.nf_serving_size_unit}</li>
                            <li><strong>Marca:</strong> {result.brand_name || "Información no disponible"}</li>
                            <li><strong>Tipo:</strong> {result.brand_name ? "Alimento de marca" : "Alimento común"}</li>
                            {result.nf_calories && <li><strong>Calorías:</strong> {result.nf_calories} kcal</li>}
                          </ul>
                          <Button variant="success" onClick={(e) => { e.stopPropagation(); addToCart(result); }} style={styles.addButton}>
                            Añadir al Carrito
                          </Button>
                        </div>
                      </Collapse>
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

  return (
    <div style={styles.pageBackground}>
      {view === 'home' ? renderHome() : renderCart()}
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundColor: '#2c2c2c', // Fondo gris oscuro para toda la página
    minHeight: '100vh',
    paddingBottom: '30px',
  },
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
    objectFit: 'contain',
    margin: 'auto',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#343a40',
  },
  cardDetails: {
    padding: '15px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #ccc',
  },
  imageContainer: {
    height: '300px',
    display: 'flex',
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
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  filterButton: {
    margin: '0 10px',
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
    color: '#f8f9fa',
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
  emptyCart: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6c757d',
  },
  noResults: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#f8f9fa',
  },
  mainLogo: {
    maxHeight: '150px',
  },
  bottomLogo: {
    maxHeight: '100px',
    marginTop: '20px',
  },
  creditText: {
    fontSize: '1rem',
    color: '#6c757d',
    marginTop: '10px',
  },
};

export default App;
