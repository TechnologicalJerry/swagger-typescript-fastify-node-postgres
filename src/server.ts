import { buildApp } from './app';
import { env } from './config/env';

async function start() {
  const app = await buildApp();

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);

    // Force terminate if graceful shutdown hangs
    const timeout = setTimeout(() => {
      app.log.error('Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000);
    timeout.unref();

    try {
      await app.close();
      app.log.info('Server closed cleanly.');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during graceful shutdown:');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    app.log.error(reason, 'Unhandled Promise Rejection:');
  });

  process.on('uncaughtException', (err) => {
    app.log.fatal(err, 'Uncaught Exception:');
    process.exit(1);
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server running at http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`);
    if (env.SWAGGER_ENABLED) {
      app.log.info(`Swagger docs available at http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}/docs`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
