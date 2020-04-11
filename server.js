const express = require('express');
const router = express.Router();

const connectDB = require('./config/db');

const app = express();

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
// Connect Database
connectDB();

// Init middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res)=> res.send(`API running`));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);

//Define routes
app.use('/api/users', require('./routes/api/users')); 
app.use('/api/auth', require('./routes/api/auth')); 
app.use('/api/profile', require('./routes/api/profiles')); 
app.use('/api/posts', require('./routes/api/posts')); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));