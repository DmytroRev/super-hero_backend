import { PHOTO_DIR, TMP_UPLOAD_DIR } from './constants/index.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import { createDirIfNotExists } from './utils/createDirIfNotExist.js';

async function bootstrap() {
  try {
    await initMongoConnection();

    await createDirIfNotExists(PHOTO_DIR);
    await createDirIfNotExists(TMP_UPLOAD_DIR);
    setupServer();
  } catch (err) {
    console.error(err);
  }
}
bootstrap();
