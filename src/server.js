import express from 'express';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import pino from 'pino-http';
import cors from 'cors';
import characterRoutes from './routes/characterRoutes.js';
import { AVATAR_DIR, IMAGE_DIR } from './constants/index.js';
// import { UPLOAD_DIR } from './constants/index.js';

const PORT = process.env.PORT || 3000;


export const setupServer = () => {
const app = express();

app.use(
  express.json({
    type: ['application/json', 'application/vnd.api+json'],
    limit: '100kb'
  })
);

app.use(cookieParser());

app.use(
pino({
    transport: {
        target: 'pino-pretty'
    }
})
);
app.use(cors());

// app.use(express.static(path.resolve('src', 'uploads')));

app.use('/characters', characterRoutes);
// app.use('/avatars', express.static(path.join(UPLOAD_DIR, 'avatars')));
app.use(express.static(path.resolve(AVATAR_DIR)));
app.use(express.static(path.resolve(IMAGE_DIR)));


// app.use('/character/avatar', express.static(UPLOAD_DIR));
// app.use('/character/image', express.static(UPLOAD_DIR));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
};

