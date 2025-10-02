const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for managing tasks and users',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['To Do', 'In Progress', 'Done', 'Canceled'],
            },
            assignee: {
              type: 'string',
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            avatar: {
              type: 'string',
            },
            comments: {
              type: 'number',
            },
            parentTask: {
              type: 'string',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};