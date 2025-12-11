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
import PosterTitle from './PosterTitle'

export default Blits.Component('JwShelf', {
  components: {
    PosterTitle,
  },
  template: `
    <Element>
      <Text
        :content="$title"
        size="28"
        font="raleway"
        color="{top: '#e2e8f0', bottom: '#cbd5e1'}"
        :alpha.transition="{value: $titleAlpha, duration: 200}"
      />
      <Element y="70" :x.transition="{value: $x, duration: 240, easing: 'ease-in-out'}">
        <PosterTitle
          :for="(item, index) in $items"
          key="$item.id"
          index="$index"
          item="$item"
          width="$cardWidth"
          ref="poster"
        />
      </Element>
    </Element>
  `,
  props: ['title', 'items', 'index', 'cardWidth'],
  state() {
    return {
      focused: 0,
      titleAlpha: 0.6,
    }
  },
  computed: {
    x() {
      const visibleItems = Math.floor(1720 / this.cardWidth)
      return 0 - Math.min(this.focused, Math.max(this.items.length - visibleItems, 0)) * this.cardWidth
    },
  },
  watch: {
    focused(value) {
      const focusItem = this.$select('poster' + value)
      if (focusItem && focusItem.$focus) {
        focusItem.$focus()
        this.$emit('shelf:itemFocus', { shelfIndex: this.index, item: this.items[value] })
      }
    },
  },
  hooks: {
    focus() {
      this.$trigger('focused')
      this.titleAlpha = 1
    },
    unfocus() {
      this.titleAlpha = 0.6
    },
  },
  input: {
    left() {
      if (this.focused === 0) {
        this.$emit('shelf:exitLeft', this.index)
        return
      }
      this.focused = Math.max(this.focused - 1, 0)
    },
    right() {
      this.focused = Math.min(this.focused + 1, Math.max(this.items.length - 1, 0))
    },
  },
})
