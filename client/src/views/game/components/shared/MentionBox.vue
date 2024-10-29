<template>
  <div class="mention-box">
    <div class="mention-overlay bg-dark mb-1" v-if="suggestMentions && currentMention && currentMention.suggestions && currentMention.suggestions.length">
      <ul>
        <li v-for="(suggestion, index) in currentMention.suggestions" :class="{ selected: index === selectedSuggestion }" :key="suggestion" @click="() => useSuggestion(suggestion)">{{suggestion}}</li>
      </ul>
    </div>
    <div class="mb-2 mb-2">
      <textarea class="form-control" id="txtMessage" :rows="rows" :placeholder="placeholderText" ref="messageElement" :value="modelValue" @input="onMessageChange" @keydown="onKeyDown" @keyup="updateSuggestions" @select="updateSuggestions" @focus="onFocus"></textarea>
    </div>
  </div>
</template>

<script>

import MentionHelper from '@/services/mentionHelper';

export default {
  props: {
    placeholder: String,
    rows: Number,
    modelValue: String
  },
  data () {
    return {
      focused: false,
      suggestMentions: false,
      currentMention: null,
      selectedSuggestion: null
    }
  },
  mounted () {
    this.$emit('onSetMessageElement', this.$refs.messageElement)
    this.suggestMentions = this.$store.state.settings.interface.suggestMentions === 'enabled'
  },
  methods: {
    useSuggestion (suggestion) {
      if (this.suggestMentions && this.currentMention) {
        this.selectedSuggestion = null

        this.$emit('onReplaceInMessage', {
          mention: this.currentMention.mention,
          text: suggestion
        })
      }
    },
    onMessageChange (e) {
      this.$emit('update:modelValue', e.target.value)
    },
    setSelectedSuggestion (newSelected) {
      const suggestions = this.currentMention.suggestions.length
      //Modulo instead of remainder so instead of -1 we get the last suggestion
      this.selectedSuggestion = ((newSelected % suggestions) + suggestions) % suggestions
    },
    async onKeyDown (e) {
      const isEnterTabKey = e.key === 'Enter' || e.key === 'Tab'

      if (isEnterTabKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.currentMention = null;
        this.$emit('onFinish')
      } else if (this.suggestMentions && this.currentMention) {
        if (isEnterTabKey && this.selectedSuggestion !== null && this.selectedSuggestion !== undefined) {
          e.preventDefault()
          this.useSuggestion(this.currentMention.suggestions[this.selectedSuggestion])
        } else if (e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault()
          this.setSelectedSuggestion(this.selectedSuggestion + 1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.setSelectedSuggestion(this.selectedSuggestion - 1)
        }
      }
    },
    onFocus (e) {
      this.$emit('onSetMessageElement', e.target)
    },
    updateSuggestions () {
      if (this.suggestMentions) {
        const oldMention = this.currentMention

        this.currentMention = MentionHelper.getCurrentMention(this.$store.state.game, this.$refs.messageElement)
        const newSuggestions = this.currentMention && this.currentMention.suggestions && this.currentMention.suggestions.length

        if (oldMention && !this.currentMention) {
          this.selectedSuggestion = null //Mention was left
        } else if ((!oldMention || !oldMention.suggestions || !oldMention.suggestions.length) && newSuggestions) {
          this.selectedSuggestion = 0 //Mention was started
        }

        if (this.currentMention && this.selectedSuggestion != null) {
          //When the number of new suggestions is smaller, the selection might not get displayed otherwise
          this.setSelectedSuggestion(this.selectedSuggestion)
        }
      }
    },
  },
  computed: {
    placeholderText: function () {
      return !this.suggestMentions ? `${this.placeholder}...` : `${this.placeholder}. Use @ for players and # for stars.`
    }
  },
  watch: {
    modelValue: function (v) {
      if (!v || v === '') {
        this.currentMention = null
      }
    }
  }
}


</script>

<style scoped>
.mention-box {
  position: relative;
}

.mention-overlay {
  position: absolute;
  z-index: 10;
  bottom: 100%;
  width: 100%;
  border-radius: 4px;
}

.mention-overlay ul {
  padding: 4px 8px;
  margin-bottom: 0;
}

.mention-overlay li {
  list-style-type: none;
  cursor: pointer;
}

.mention-overlay .selected {
  font-weight: bold;
}
</style>
