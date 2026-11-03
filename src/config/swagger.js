const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SalesHub API',
      version: '1.0.0',
      description: 'B2B IT Sales Management Platform API documentation',
      contact: {
        name: 'SalesHub Team',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000/api',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Scan route files for JSDoc annotations
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpecs;
