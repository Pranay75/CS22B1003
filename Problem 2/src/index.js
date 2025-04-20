import express from 'express';
import apiClient from './axios.js'; 
import apiRoutes from './api.js';
import { dataStore } from './data.js';

const app = express();
const PORT = 3000;

async function fetchOnce() {
  //Use cache if already loaded
  if (dataStore.users && dataStore.posts && Object.keys(dataStore.commentsperid).length > 0) {
    return;
  }

  try {
    const [usersRes, postsRes] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/posts')
    ]);

    dataStore.users = usersRes.data;
    dataStore.posts = postsRes.data;
    console.log(dataStore.users)
    const commentFetches = dataStore.posts.map(post =>
      apiClient.get(`/comments?post_id=${post.id}`).then(res => {
        dataStore.commentsperid[post.id] = res.data;
      })
    );

    await Promise.all(commentFetches);
  } catch (error) {
    console.error('Error loading data:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', error.response.data);
    }
    process.exit(1); 
  }
}

app.use(async (req, res, next) => {
  await fetchOnce();
  next();
});


app.use('/', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
