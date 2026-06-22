import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const authorSelect = { id: true, firstName: true, lastName: true, avatar: true };

const generateSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const calcReadTime = (content) => Math.ceil(content.split(/\s+/).length / 200);

// @route   GET /api/blog
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, tag, search, featured } = req.query;

    const where = { status: 'published' };
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true,
          category: true, tags: true, status: true, isFeatured: true, views: true,
          readTime: true, publishedAt: true, createdAt: true, updatedAt: true,
          author: { select: authorSelect },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalPosts: total, hasMore: page * limit < total },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
  }
});

// @route   GET /api/blog/categories
router.get('/categories', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { category: true },
    });
    const counts = {};
    posts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const categories = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blog/tags
router.get('/tags', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { tags: true },
    });
    const counts = {};
    posts.forEach(p => (p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    const tags = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blog/featured
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published', isFeatured: true },
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true,
        category: true, tags: true, readTime: true, publishedAt: true,
        author: { select: authorSelect },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured posts' });
  }
});

// @route   GET /api/blog/admin
router.get('/admin', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        include: { author: { select: authorSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { posts, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalPosts: total } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
  }
});

// @route   GET /api/blog/:slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: authorSelect } },
    });

    if (!post || (post.status !== 'published' && !req.headers.authorization)) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
    res.status(200).json({ success: true, data: { ...post, views: post.views + 1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog post' });
  }
});

// @route   POST /api/blog
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, status, isFeatured, metaTitle, metaDescription } = req.body;

    const slug = generateSlug(title);
    const readTime = calcReadTime(content);

    const post = await prisma.blogPost.create({
      data: {
        title, slug, excerpt, content, coverImage, category,
        tags: tags || [], authorId: req.user.id, status: status || 'draft',
        isFeatured: isFeatured || false, readTime, metaTitle, metaDescription,
        publishedAt: status === 'published' ? new Date() : null,
      },
      include: { author: { select: authorSelect } },
    });

    res.status(201).json({ success: true, data: post, message: 'Blog post created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create blog post' });
  }
});

// @route   PUT /api/blog/:id
router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, status, ...rest } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Blog post not found' });

    const updateData = { ...rest };
    if (title) { updateData.title = title; updateData.slug = generateSlug(title); }
    if (content) { updateData.content = content; updateData.readTime = calcReadTime(content); }
    if (status) {
      updateData.status = status;
      if (status === 'published' && !existing.publishedAt) updateData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: updateData,
      include: { author: { select: authorSelect } },
    });

    res.status(200).json({ success: true, data: post, message: 'Blog post updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update blog post' });
  }
});

// @route   PATCH /api/blog/:id/featured
router.patch('/:id/featured', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Blog post not found' });

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: { isFeatured: !existing.isFeatured },
      include: { author: { select: authorSelect } },
    });

    res.status(200).json({ success: true, data: post, message: `Blog post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle featured status' });
  }
});

// @route   DELETE /api/blog/:id
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Blog post not found' });
    res.status(500).json({ success: false, message: 'Failed to delete blog post' });
  }
});

export default router;
