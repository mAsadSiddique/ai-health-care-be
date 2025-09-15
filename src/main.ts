import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // Fix CORS configuration
  app.enableCors({
    origin: [
      "https://ai-health-care.netlify.app/login",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4200",
      // Add your frontend URL here
      "http://31.97.221.245:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "Access-Control-Allow-Headers",
    ],
    credentials: true, // Important for authentication cookies/sessions
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  const config = new DocumentBuilder()
    .setTitle("Health Care Portal")
    .setDescription(
      "API collection for managing healthcare data, appointments, patients, and services"
    )
    .setVersion("1.0")
    .addTag("Health Care")
    .addBearerAuth(
      {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        bearerFormat: "JWT",
      },
      "JWT"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(process.env.PORT || 3000, "0.0.0.0");
}
bootstrap();
