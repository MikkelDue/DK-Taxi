<template>
  <span class="am-oit__wrapper">
    <span class="am-oit">
      <span class="am-oit__img">
        <span class="am-oit__img-placeholder" :style="{backgroundImage: `url(${imageThumb})`}"></span>
      </span>
      <span class="am-oit__data">
        <span class="am-oit__data-label">
          {{ label }}
        </span>
        <span v-if="description" class="am-oit__data-description">
          {{ description }}
        </span>
      </span>
      <span v-if="price" class="am-oit__price">
        {{ `+ ${currencySymbol}${price}` }}
      </span>
      <span v-if="description" class="am-oit__info-trigger" @click="dialogInfoVisible">
        <span class="am-icon-circle-info"></span>
      </span>
    </span>
    <AmDialog
      v-if="description"
      v-model="infoVisible"
      :custom-class="'am-option-template-dialog'"
      :append-to-body="true"
    >
      <template #title>
        <span class="am-dialog__title">
          {{ dialogTitle }}
        </span>
      </template>
      <div class="am-dialog__body">
        <div class="am-dialog__body-heading">
          <div class="am-dialog__body-heading__avatar" :style="{backgroundImage: `url(${imageThumb})`}"></div>
          <div class="am-dialog__body-heading__text">
            {{ label }}
          </div>
        </div>
        <div class="am-dialog__body-content">
          {{ description }}
        </div>
      </div>
      <template #footer>
        <AmButton type="primary" @click="handleClick">
          {{ dialogButtonText }}
        </AmButton>
      </template>
    </AmDialog>
  </span>
</template>

<script setup>
import AmDialog from '../../dialog/AmDialog.vue'
import AmButton from '../../button/AmAdvButton.vue'
import { ref } from 'vue'

/**
 * Component Props
 */
const prop = defineProps({
  identifier: {
    type: [String, Number],
    required: true
  },
  imageThumb: {
    type: String,
    default: ''
  },
  label: {
    type: [String, Number],
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: [String, Number],
    default: ''
  },
  dialogTitle: {
    type: String,
    default: 'fdsafas'
  },
  dialogButtonText: {
    type: String,
    default: ''
  }
})

/**
 * Component Emits
 * */
const emits = defineEmits(['click'])

// Currency Symbol
let currencySymbol = ref('$')

// Dialog Visibility
let infoVisible = ref(false)

/**
 * Component Methods
 */
const dialogInfoVisible = (e) => {
  e.stopPropagation()
  infoVisible.value = true
}

/**
 * Component Event Handlers
 */
const handleClick = () => {
  infoVisible.value = false
  emits('click', prop.identifier)
}
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang="scss">
// am - Amelia
// oit - option inner template
.am-oit {
  width: 100%;
  display: flex;
  align-items: center;

  * {
    font-family: var(--am-font-family);;
  }

  &__wrapper {
    display: flex;
  }

  &__img {
    display: flex;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    margin-right: 8px;

    &-placeholder {
      display: block;
      width: 100%;
      height: 100%;
      background-color: #00a32a;
      border-radius: 50%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  &__data {
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    min-width: 0;

    &-label {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.25;
      color: $blue-900;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-description {
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--am-c-main-text);;
    }
  }

  &__price {
    display: flex;
    flex-shrink: 0;
    align-self: center;
    justify-content: center;
    min-width: 70px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.25;
    color: $blue-900;
  }

  &__info {
    &-trigger {
      display: flex;
      padding: 0 0 8px 8px;
      color: $blue-900;
    }
  }
}

.am-option-template-dialog {
  font-family: var(--am-font-family);;

  * {
    font-family: var(--am-font-family);;
  }

  &.el-dialog {
    max-width: 520px;
  }

  .el-dialog {
    &__header {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.5;
      color: #808A90;
      padding: 16px;
    }

    &__headerbtn {
      font-size: 10px;
    }

    &__body {
      padding: 0 16px 48px;
    }
  }

  .am-dialog {
    &__body {
      &-heading {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        &__avatar {
          display: flex;
          width: 54px;
          height: 54px;
          background-color: #00a32a;
          border-radius: 50%;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          margin-right: 12px;
        }

        &__text {
          font-size: 18px;
          font-weight: 500;
          line-height: 1.555555;
        }
      }

      &-content {
        font-size: 16px;
        font-weight: 400;
        line-height: 1.5;
        word-break: break-word;
        color: #33434C;
      }
    }
  }
}
</style>