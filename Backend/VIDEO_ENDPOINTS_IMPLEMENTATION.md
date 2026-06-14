# Video Like/Save Endpoints Implementation Guide

## Database Schema Needed

You'll need two new tables:

```sql
-- Video Likes Table
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES content_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_likes_user ON video_likes(user_id);
CREATE INDEX idx_video_likes_video ON video_likes(video_id);

-- Video Saves Table
CREATE TABLE video_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES content_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_saves_user ON video_saves(user_id);
CREATE INDEX idx_video_saves_video ON video_saves(video_id);
```

## Service Methods to Add

Add these methods to `Backend/src/services/Content.videos.ts`:

```typescript
// Like a video
async likeVideo(req: Request, res: Response): Promise<Response> {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user.id; // From authMiddleware

    // Check if video exists
    const videoExists = await pool.query(
      'SELECT id FROM content_videos WHERE id = $1',
      [videoId]
    );

    if (videoExists.rows.length === 0) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Insert like (ignore if already liked)
    await pool.query(
      `INSERT INTO video_likes (user_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, video_id) DO NOTHING`,
      [userId, videoId]
    );

    // Update likes count in videos table
    await pool.query(
      `UPDATE content_videos
       SET likes_count = (SELECT COUNT(*) FROM video_likes WHERE video_id = $1)
       WHERE id = $1`,
      [videoId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Video liked successfully'
    });
  } catch (error) {
    console.error('Like video error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}

// Unlike a video
async unlikeVideo(req: Request, res: Response): Promise<Response> {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user.id;

    // Delete like
    await pool.query(
      'DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    // Update likes count
    await pool.query(
      `UPDATE content_videos
       SET likes_count = (SELECT COUNT(*) FROM video_likes WHERE video_id = $1)
       WHERE id = $1`,
      [videoId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Video unliked successfully'
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}

// Save a video
async saveVideo(req: Request, res: Response): Promise<Response> {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user.id;

    await pool.query(
      `INSERT INTO video_saves (user_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, video_id) DO NOTHING`,
      [userId, videoId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Video saved successfully'
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}

// Unsave a video
async unsaveVideo(req: Request, res: Response): Promise<Response> {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user.id;

    await pool.query(
      'DELETE FROM video_saves WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Video unsaved successfully'
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}

// Get user's liked videos
async getUserLikedVideos(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT cv.*
       FROM content_videos cv
       INNER JOIN video_likes vl ON cv.id = vl.video_id
       WHERE vl.user_id = $1
       ORDER BY vl.created_at DESC`,
      [userId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}

// Get user's saved videos
async getUserSavedVideos(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT cv.*
       FROM content_videos cv
       INNER JOIN video_saves vs ON cv.id = vs.video_id
       WHERE vs.user_id = $1
       ORDER BY vs.created_at DESC`,
      [userId]
    );

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}
```

## Update Video Query

In your `getAllVideos` method, update the query to include like status:

```typescript
async getAllVideos(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req as any).user?.id; // Optional, may be guest

    const query = userId ? `
      SELECT
        cv.*,
        EXISTS(SELECT 1 FROM video_likes WHERE user_id = $1 AND video_id = cv.id) as is_liked,
        EXISTS(SELECT 1 FROM video_saves WHERE user_id = $1 AND video_id = cv.id) as is_saved,
        (SELECT COUNT(*) FROM video_likes WHERE video_id = cv.id) as likes_count
      FROM content_videos cv
      ORDER BY cv.created_at DESC
    ` : `
      SELECT
        cv.*,
        false as is_liked,
        false as is_saved,
        (SELECT COUNT(*) FROM video_likes WHERE video_id = cv.id) as likes_count
      FROM content_videos cv
      ORDER BY cv.created_at DESC
    `;

    const result = await pool.query(query, userId ? [userId] : []);

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Server error: ${error}`
    });
  }
}
```

## Steps to Implement

1. **Run the SQL** to create the tables
2. **Add the methods** to your video service
3. **Restart your backend**
4. **Test the endpoints** with Postman
5. **Uncomment the frontend API calls** in VideoScroll.js

## Frontend Update Required

After implementing, update VideoScroll.js:

```javascript
// Change these lines (around line 226-227):
const likedResponse = await axios.get(
  `http://${ip}:8000/api/v1/content/videos/user/liked`,
  { headers: { Authorization: `Bearer ${authToken}` }}
);

// And line 233-234:
const savedResponse = await axios.get(
  `http://${ip}:8000/api/v1/content/videos/user/saved`,
  { headers: { Authorization: `Bearer ${authToken}` }}
);

// Then uncomment the API calls in handleLike and handleSave functions
```

That's it! The endpoints are now ready to be implemented.
