const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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
          required: ['title', 'project'],
          properties: {
            title: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['To Do', 'In Progress', 'Done', 'Canceled'],
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
            comments: {
              type: 'number',
            },
            parentTask: {
              type: 'string',
            },
            project: {
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
        Project: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            managerId: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
            },
            assigneeIds: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Tenant: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            slug: {
              type: 'string'
            }
          }
        },
        Assignee: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            email: {
              type: 'string',
            },
            role: {
              type: 'string',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // Add security definitions
    // Add security definitions
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, './routes/*.js')], // Use absolute path to ensure correct file resolution
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};