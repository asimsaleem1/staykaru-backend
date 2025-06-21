import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/images/',
  });

  // Enable CORS for client-side authentication
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://staykaru.tech',
      'https://www.staykaru.tech',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('StayKaro API')
    .setDescription('The StayKaro API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('locations', 'Location management endpoints')
    .addTag('accommodations', 'Accommodation management endpoints')
    .addTag('food-providers', 'Food provider management endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('payments', 'Payment management endpoints')
    .addTag('reviews', 'Review management endpoints')
    .addTag('analytics', 'Analytics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add example for nearby accommodations endpoint
  document.paths['/accommodations/nearby'] = {
    get: {
      tags: ['accommodations'],
      summary: 'Find nearby accommodations',
      parameters: [
        {
          name: 'lat',
          in: 'query',
          required: true,
          schema: { type: 'number', example: 31.5204 },
        },
        {
          name: 'lng',
          in: 'query',
          required: true,
          schema: { type: 'number', example: 74.3587 },
        },
        {
          name: 'radius',
          in: 'query',
          required: false,
          schema: { type: 'number', example: 5000 },
        },
      ],
      responses: {
        200: {
          description: 'Returns nearby accommodations',
        },
      },
    },
  };

  SwaggerModule.setup('api', app, document);

  // Serve static files from the "public" directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Use the PORT provided by Heroku or default to 3002
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://[::1]:${port}`);
}
void bootstrap();
