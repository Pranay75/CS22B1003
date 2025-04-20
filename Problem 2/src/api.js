import express from 'express';
import { dataStore } from './data.js';

const router = express.Router();

router.get('/users', (req, res) => {
  const userCommentCounts = {};

  for (const post of dataStore.posts) {
    const commentCount = dataStore.commentsperid[post.id]?.length || 0;
    const userId = post.user_id;

    userCommentCounts[userId] = (userCommentCounts[userId] || 0) + commentCount;
  }

  const topUsers = Object.entries(userCommentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, totalComments]) => ({
      ...dataStore.users.find(u => u.id === Number(userId)),
      total_comments: totalComments
    }));

  res.json(topUsers);
});

router.get('/posts', (req, res) => {
  const type = req.query.type;

  if (type === 'latest') {
    const latest = [...dataStore.posts]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    return res.json(latest);
  }

  if (type === 'popular') {
    const withCounts = dataStore.posts.map(post => ({
      ...post,
      comment_count: dataStore.commentsperid[post.id]?.length || 0
    }));

    const maxCount = Math.max(...withCounts.map(p => p.comment_count));
    const topPosts = withCounts.filter(p => p.comment_count === maxCount);

    return res.json(topPosts);
  }

  res.status(400).json({ error: 'Invalid query' });
});

export default router;
