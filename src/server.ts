import { buildApp } from './app';
import { env } from './config/env';

async function start() {
  const app = await buildApp();

  // Graceful shutdown handling
  const listeners = ['SIGINT', 'SIGTERM'];
  for (const signal of listeners) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}. Shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  }

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server running at http://localhost:${env.PORT}`);
    app.log.info(`Swagger docs available at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
