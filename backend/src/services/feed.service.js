import { Post } from '../models/Post.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const feedService = {
  /**
   * List campus feed posts with filters
   */
  async getPosts(query = {}) {
    const filter = { status: 'PUBLISHED' };

    if (query.category && query.category.trim() && query.category !== 'ALL') {
      filter.category = query.category.trim().toUpperCase();
    }

    if (query.communityId && query.communityId.trim()) {
      filter.community = query.communityId.trim();
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .populate('author', 'fullName role profileImage college')
        .populate('community', 'name accentColor')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const items = posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      category: p.category,
      badgeVariant: p.badgeVariant || 'yellow',
      isPinned: p.isPinned || false,
      author: p.author
        ? {
            id: p.author._id.toString(),
            fullName: p.author.fullName,
            role: p.author.role,
            profileImage: p.author.profileImage || '',
          }
        : null,
      community: p.community
        ? {
            id: p.community._id.toString(),
            name: p.community.name,
            accentColor: p.community.accentColor || 'blue',
          }
        : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      posts: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single post
   */
  async getPostById(postId) {
    const post = await Post.findById(postId)
      .populate('author', 'fullName role profileImage college')
      .populate('community', 'name accentColor')
      .lean();

    if (!post || post.status === 'REMOVED') {
      throw new ApiError(404, 'Campus feed post not found.');
    }

    return {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      category: post.category,
      badgeVariant: post.badgeVariant || 'yellow',
      isPinned: post.isPinned || false,
      author: post.author
        ? {
            id: post.author._id.toString(),
            fullName: post.author.fullName,
            role: post.author.role,
          }
        : null,
      community: post.community
        ? {
            id: post.community._id.toString(),
            name: post.community.name,
          }
        : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  },

  /**
   * Create a new campus post
   */
  async createPost(userId, data) {
    const { title, content, category, communityId, badgeVariant } = data;

    if (!title || title.trim().length < 3) {
      throw new ApiError(400, 'Post title must be at least 3 characters.');
    }

    if (!content || content.trim().length < 5) {
      throw new ApiError(400, 'Post content must be at least 5 characters.');
    }

    const defaultBadge =
      category === 'ANNOUNCEMENT'
        ? 'orange'
        : category === 'CAMPUS_EVENT'
        ? 'yellow'
        : category === 'SOCIETY_UPDATE'
        ? 'blue'
        : 'yellow';

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      category: (category || 'GENERAL').toUpperCase(),
      author: userId,
      community: communityId || null,
      badgeVariant: badgeVariant || defaultBadge,
      status: 'PUBLISHED',
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'fullName role profileImage')
      .populate('community', 'name accentColor')
      .lean();

    return {
      id: populated._id.toString(),
      title: populated.title,
      content: populated.content,
      category: populated.category,
      badgeVariant: populated.badgeVariant,
      author: {
        id: populated.author._id.toString(),
        fullName: populated.author.fullName,
        role: populated.author.role,
      },
      community: populated.community
        ? {
            id: populated.community._id.toString(),
            name: populated.community.name,
          }
        : null,
      createdAt: populated.createdAt,
    };
  },

  /**
   * Edit post (Only author or admin)
   */
  async updatePost(postId, userId, userRole, data) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the post author or an administrator can edit this post.');
    }

    if (data.title !== undefined) {
      if (data.title.trim().length < 3) {
        throw new ApiError(400, 'Post title must be at least 3 characters.');
      }
      post.title = data.title.trim();
    }

    if (data.content !== undefined) {
      if (data.content.trim().length < 5) {
        throw new ApiError(400, 'Post content must be at least 5 characters.');
      }
      post.content = data.content.trim();
    }

    if (data.category !== undefined) {
      post.category = data.category.toUpperCase();
    }

    await post.save();

    return {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      category: post.category,
      updatedAt: post.updatedAt,
    };
  },

  /**
   * Delete post (Author or Admin moderation)
   */
  async deletePost(postId, userId, userRole) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = String(userRole).toLowerCase() === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ApiError(403, 'Unauthorized. Only the post author or an administrator can delete this post.');
    }

    await Post.findByIdAndDelete(postId);
    return { success: true };
  },
};

export default feedService;

