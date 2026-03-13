import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ContentPost, SocialPlatform, PostStatus, PostType, PostMetrics } from '@/data/conteudo';

export function useContentPosts() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('content_posts').select('*').order('scheduled_date');
    if (error) { console.error('Error fetching content posts:', error); setLoading(false); return; }
    setPosts((data || []).map(row => {
      const metrics: PostMetrics | undefined = row.impressions != null ? {
        impressions: row.impressions, reach: row.reach || 0,
        likes: row.likes || 0, comments: row.comments || 0,
        shares: row.shares || 0, saves: row.saves || 0,
        clicks: row.clicks || 0, ctr: row.ctr || 0,
        spent: row.spent ?? undefined, conversions: row.conversions ?? undefined,
      } : undefined;
      return {
        id: row.id, platform: row.platform as SocialPlatform,
        type: row.type as PostType, title: row.title,
        description: row.description, status: row.status as PostStatus,
        scheduledDate: row.scheduled_date, scheduledTime: row.scheduled_time ?? undefined,
        publishedDate: row.published_date ?? undefined,
        hashtags: row.hashtags || [], responsavel: row.responsavel,
        metrics, campaignName: row.campaign_name ?? undefined,
      };
    }));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const addPost = async (post: Omit<ContentPost, 'id'>) => {
    const { error } = await supabase.from('content_posts').insert({
      platform: post.platform, type: post.type, title: post.title,
      description: post.description, status: post.status,
      scheduled_date: post.scheduledDate, scheduled_time: post.scheduledTime || null,
      published_date: post.publishedDate || null, hashtags: post.hashtags,
      responsavel: post.responsavel, campaign_name: post.campaignName || null,
      impressions: post.metrics?.impressions || null, reach: post.metrics?.reach || null,
      likes: post.metrics?.likes || null, comments: post.metrics?.comments || null,
      shares: post.metrics?.shares || null, saves: post.metrics?.saves || null,
      clicks: post.metrics?.clicks || null, ctr: post.metrics?.ctr || null,
      spent: post.metrics?.spent || null, conversions: post.metrics?.conversions || null,
    });
    if (error) console.error('Error adding post:', error);
    else await fetchPosts();
    return !error;
  };

  return { posts, loading, fetchPosts, addPost, setPosts };
}
