/* eslint-env node */
/**
 * Server-side fetcher for the social-media-feeds block.
 *
 * Runs from a scheduled GitHub Action (see
 * .github/workflows/social-media-feed.yml) so that Facebook/Instagram/
 * YouTube API tokens live only in GitHub Actions Secrets and never ship
 * to the browser. Writes the combined, sorted feed to social-media-feed.json
 * at the repo root, which the block fetches as a static asset.
 */
import { writeFile } from 'node:fs/promises';

const {
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  FB_PAGE_ID,
  FB_PAGE_ACCESS_TOKEN,
  IG_USER_ID,
  IG_ACCESS_TOKEN,
} = process.env;

const OUTPUT_PATH = new URL('../../social-media-feed.json', import.meta.url);
const MAX_ITEMS = 60;

async function fetchYouTubeFeed() {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) return [];
  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      console.error('YouTube API error:', data.error.message);
      return [];
    }
    return (data.items || [])
      .filter((item) => item.id.kind === 'youtube#video')
      .map((item) => ({
        type: 'youtube',
        title: item.snippet.title,
        image: item.snippet.thumbnails.medium.url,
        date: new Date(item.snippet.publishedAt).toISOString(),
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
  } catch (error) {
    console.error('YouTube fetch failed:', error.message);
    return [];
  }
}

// Meta only supports Graph API versions for ~2 years; pin a current one (v19.0 started
// silently rejecting fields once it aged out).
const GRAPH_API_VERSION = 'v23.0';

async function fetchFacebookFeed() {
  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) return [];
  console.log('DEBUG FB_PAGE_ID:', JSON.stringify(FB_PAGE_ID), 'token length:', FB_PAGE_ACCESS_TOKEN.length);
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${FB_PAGE_ID}/posts?fields=id,message,full_picture,created_time&access_token=${FB_PAGE_ACCESS_TOKEN}&limit=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      console.error('Facebook API error:', data.error.message);
      return [];
    }
    return (data.data || []).map((item) => ({
      type: 'facebook',
      title: item.message ? item.message.substring(0, 100) : 'No message',
      image: item.full_picture,
      date: new Date(item.created_time).toISOString(),
      link: `https://www.facebook.com/${FB_PAGE_ID}/posts/${item.id}`,
    }));
  } catch (error) {
    console.error('Facebook fetch failed:', error.message);
    return [];
  }
}

async function fetchInstagramFeed() {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) return [];
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${IG_USER_ID}/media?fields=${fields}&access_token=${IG_ACCESS_TOKEN}&limit=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      console.error('Instagram API error:', data.error.message);
      return [];
    }
    return (data.data || []).map((item) => ({
      type: 'instagram',
      title: item.caption ? item.caption.substring(0, 100) : 'No caption',
      image: item.media_type === 'VIDEO'
        ? (item.thumbnail_url || item.media_url)
        : (item.media_url || item.thumbnail_url),
      date: new Date(item.timestamp).toISOString(),
      link: item.permalink,
      mediaType: item.media_type,
    }));
  } catch (error) {
    console.error('Instagram fetch failed:', error.message);
    return [];
  }
}

async function main() {
  const [youtube, facebook, instagram] = await Promise.all([
    fetchYouTubeFeed(),
    fetchFacebookFeed(),
    fetchInstagramFeed(),
  ]);

  const items = [...youtube, ...facebook, ...instagram]
    .filter((item) => item.image && item.link && !Number.isNaN(new Date(item.date).getTime()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_ITEMS);

  const payload = {
    generatedAt: new Date().toISOString(),
    items,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${items.length} items to ${OUTPUT_PATH.pathname}`);
}

main();
