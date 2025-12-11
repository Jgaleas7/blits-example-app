/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const JW_BASE = import.meta.env.VITE_JWPLAYER_BASE_URL || 'https://cdn.jwplayer.com'
const JW_TOKEN = import.meta.env.VITE_JWPLAYER_API_TOKEN
const PLAYLIST_CONFIG = import.meta.env.VITE_JWPLAYER_PLAYLISTS

const DEFAULT_SHELVES = [
  {
    title: 'Spotlight',
    playlistId: 'spotlight',
    items: [
      {
        id: 'demo-1',
        title: 'City Lights',
        description: 'A cityscape time-lapse to showcase the new cinematic shell.',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1280&q=80',
        duration: 94,
      },
      {
        id: 'demo-2',
        title: 'Into the Forest',
        description: 'Natural textures and depth to test gradients and overlays.',
        poster: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1280&q=80',
        duration: 133,
      },
      {
        id: 'demo-3',
        title: 'Skydive',
        description: 'High-adrenaline footage to prove focus transitions are smooth.',
        poster: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1280&q=80',
        duration: 150,
      },
    ],
  },
  {
    title: 'Relax',
    playlistId: 'relax',
    items: [
      {
        id: 'demo-4',
        title: 'Calm Waters',
        description: 'Gentle lake waves for a minimal living-room background.',
        poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
        duration: 102,
      },
      {
        id: 'demo-5',
        title: 'Horizon',
        description: 'Sunset gradients that pair with the hero overlay.',
        poster: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc8?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1493244040629-496f6d136cc8?auto=format&fit=crop&w=1280&q=80',
        duration: 89,
      },
      {
        id: 'demo-6',
        title: 'Mountains',
        description: 'Crisp details for HDR QA or standby screens.',
        poster: 'https://images.unsplash.com/photo-1523419400524-2100f3a1d498?auto=format&fit=crop&w=640&q=80',
        background:
          'https://images.unsplash.com/photo-1523419400524-2100f3a1d498?auto=format&fit=crop&w=1280&q=80',
        duration: 121,
      },
    ],
  },
]

const defaultHeaders = {
  Accept: 'application/json',
}

if (JW_TOKEN) {
  defaultHeaders.Authorization = `Bearer ${JW_TOKEN}`
}

export const parseShelfConfig = (configString = PLAYLIST_CONFIG) => {
  if (!configString) return []
  return configString
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [title, playlistId] = entry.split(':').map((part) => part.trim())
      return { title: title || playlistId, playlistId }
    })
    .filter((item) => item.playlistId)
}

export const fetchPlaylist = async (playlistId) => {
  const response = await fetch(`${JW_BASE}/v2/playlists/${playlistId}?page_limit=25`, {
    headers: defaultHeaders,
  })

  if (!response.ok) {
    throw new Error(`JW Player request failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.playlist) return []

  return data.playlist.map(mapMediaItem(playlistId))
}

const mapMediaItem = (playlistId) => (media) => ({
  id: media.mediaid,
  title: media.title,
  description: media.description || '',
  duration: media.duration,
  playlistId,
  poster: media.image,
  background: media.image,
})

export const fetchShelves = async (config = parseShelfConfig()) => {
  const shelfConfig = config.length ? config : DEFAULT_SHELVES
  const shelves = []

  for (const shelf of shelfConfig) {
    if (!shelf.playlistId || !shelf.title) continue

    try {
      const items = Array.isArray(shelf.items) ? shelf.items : await fetchPlaylist(shelf.playlistId)
      shelves.push({ ...shelf, items })
    } catch (error) {
      console.warn(`Falling back to demo data for ${shelf.title}:`, error.message)
      shelves.push({ ...shelf, items: shelf.items || [] })
    }
  }

  if (shelves.length === 0) return DEFAULT_SHELVES

  const shelvesWithFallback = shelves.map((shelf, index) => {
    if (shelf.items?.length) return shelf
    return { ...shelf, items: DEFAULT_SHELVES[index % DEFAULT_SHELVES.length].items }
  })

  return shelvesWithFallback
}

export default {
  fetchShelves,
  fetchPlaylist,
  parseShelfConfig,
}
