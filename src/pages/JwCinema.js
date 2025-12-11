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

import Blits from '@lightningjs/blits'
import Background from '../components/Background'
import JwShelf from '../components/JwShelf'
import { fetchShelves } from '../api/jwplayer'

const CARD_WIDTH = 215

export default Blits.Component('JwCinema', {
  components: {
    Background,
    JwShelf,
  },
  template: `
    <Element w="1920" h="1080" color="#0b1224">
      <Background :bgImg="$heroBackground" />
      <Element color="{top: '#0b1224dd', bottom: '#0b1224'}" w="1920" h="1080" />

      <Element x="80" y="64">
        <Text content="ChekPlus TV" font="raleway" size="64" color="#f8fafc" />
        <Text
          content="JW Player powered shelves, tuned for living room speed."
          y="74"
          color="#cbd5e1"
          size="24"
          lineheight="32"
          maxwidth="1200"
        />
      </Element>

      <Element x="80" y="200">
        <Element :for="(item, index) in $menuItems" y="$index * 48">
          <Text
            :content="$item"
            font="raleway"
            size="26"
            :alpha.transition="{value: $menuAlpha(index), duration: 140}"
            :color="$menuColor(index)"
          />
        </Element>
      </Element>

      <Element x="360" y="200" :y.transition="{value: $shelfOffset, duration: 300}">
        <JwShelf
          :for="(shelf, index) in $shelves"
          key="$shelf.title"
          :title="$shelf.title"
          :items="$shelf.items"
          :index="$index"
          :cardWidth="$cardWidth"
          y="$index * 320"
          ref="shelf"
        />
      </Element>

      <Element x="80" y="880" w="1760" color="{top: '#0b122488', bottom: '#0b1224aa'}" h="160">
        <Text :content="$heroTitle" font="raleway" size="48" x="32" y="18" maxwidth="1200" />
        <Text
          :content="$heroDescription"
          x="32"
          y="86"
          size="24"
          color="#cbd5e1"
          maxwidth="1200"
          lineheight="30"
          maxlines="2"
        />
        <Text
          :content="$heroMeta"
          x="1500"
          y="30"
          size="22"
          color="#94a3b8"
          maxwidth="220"
          textalign="right"
        />
      </Element>
    </Element>
  `,
  state() {
    return {
      shelves: [],
      hero: null,
      activeShelf: 0,
      focusArea: 'shelves',
      cardWidth: CARD_WIDTH,
      shelfOffset: 0,
    }
  },
  computed: {
    menuItems() {
      return this.shelves.map((shelf) => shelf.title)
    },
    heroBackground() {
      return this.hero?.background
    },
    heroTitle() {
      return this.hero?.title || 'Loading your lineup'
    },
    heroDescription() {
      return this.hero?.description || 'Fetching JW Player shelves and preparing focus rings.'
    },
    heroMeta() {
      if (!this.hero?.duration) return ''
      const minutes = Math.floor(this.hero.duration / 60)
      const seconds = Math.floor(this.hero.duration % 60)
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    },
    shelfOffset() {
      return -this.activeShelf * 320
    },
  },
  watch: {
    activeShelf(value) {
      const target = this.$select('shelf' + value)
      if (target && target.$focus) target.$focus()
    },
    shelves(value) {
      if (value.length && !this.hero) {
        const firstShelf = value[0]
        this.hero = firstShelf.items?.[0]
      }
    },
  },
  hooks: {
    async init() {
      this.shelves = await fetchShelves()
    },
    ready() {
      this.$listen('shelf:itemFocus', ({ shelfIndex, item }) => {
        this.activeShelf = shelfIndex
        this.hero = item
      })
      this.$listen('shelf:exitLeft', (shelfIndex) => {
        if (shelfIndex !== this.activeShelf) return
        this.focusArea = 'menu'
      })
    },
    focus() {
      this.focusArea = 'shelves'
      this.activeShelf = Math.min(this.activeShelf, Math.max(this.shelves.length - 1, 0))
      const target = this.$select('shelf' + this.activeShelf)
      target && target.$focus && target.$focus()
    },
  },
  methods: {
    menuAlpha(index) {
      return this.focusArea === 'menu' && this.activeShelf === index ? 1 : 0.6
    },
    menuColor(index) {
      if (this.focusArea === 'menu' && this.activeShelf === index) return '#f1f5f9'
      if (this.activeShelf === index) return '#e2e8f0'
      return '#94a3b8'
    },
  },
  input: {
    up() {
      if (this.focusArea === 'menu') {
        this.activeShelf = Math.max(this.activeShelf - 1, 0)
        return
      }

      this.activeShelf = Math.max(this.activeShelf - 1, 0)
      if (this.activeShelf === 0) {
        this.focusArea = 'menu'
      }
    },
    down() {
      this.focusArea = 'shelves'
      this.activeShelf = Math.min(this.activeShelf + 1, Math.max(this.shelves.length - 1, 0))
    },
    left() {
      if (this.focusArea === 'shelves') {
        this.focusArea = 'menu'
      }
    },
    right() {
      if (this.focusArea === 'menu') {
        this.focusArea = 'shelves'
        const target = this.$select('shelf' + this.activeShelf)
        target && target.$focus && target.$focus()
      }
    },
  },
})
