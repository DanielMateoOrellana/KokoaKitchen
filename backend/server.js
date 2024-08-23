const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.NUTRITIONIX_API_KEY;
const API_ID = process.env.NUTRITIONIX_APP_ID;

if (!API_KEY) {
    throw new Error("API_KEY is not set or is invalid");
}

if (!API_ID) {
    throw new Error("API_ID is not set or is invalid");
}

app.get('/api/nutritionix', async (req, res) => {
    const query = req.query.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "You must supply a query string" });
    }

    try {
        const response = await axios.get(`https://trackapi.nutritionix.com/v2/search/instant`, {
            headers: {
                'x-app-id': API_ID,
                'x-app-key': API_KEY,
                'Content-Type': 'application/json'
            },
            params: {
                query: query,
                branded: true,  
        }});

        if (!response.data || (!response.data.common && !response.data.branded)) {
            return res.status(404).json({ error: "No results found" });
        }

        const items = [
            ...response.data.common.map(food => ({
                item_name: food.food_name,
                brand_name: "Common Food",
                nf_calories: null, 
                nf_serving_size_qty: food.serving_qty,
                nf_serving_size_unit: food.serving_unit,
                photo_url: food.photo.thumb || "https://example.com/default-image.jpg"
            })),
            ...response.data.branded.map(food => ({
                item_name: food.food_name,
                brand_name: food.brand_name,
                nf_calories: food.nf_calories, 
                nf_serving_size_qty: food.serving_qty,
                nf_serving_size_unit: food.serving_unit,
                photo_url: food.photo.thumb || "https://example.com/default-image.jpg"
            }))
        ];

        return res.status(200).json(items);
    } catch (error) {
        console.error('Error al obtener datos de Nutritionix:', error.message);
        return res.status(500).json({ message: 'Error al obtener datos de Nutritionix' });
    }
});
// Dropdown con radio buttons para filtrar por:
// Common foods y Branded Foods
// Lista de compras en una nueva pantalla con checkboxes
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
