<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

// Default values
const defaultReminders = [
  '1 dag før, kl. 09.00',
  'dagligt kl. 09.00 efter overskredet deadline'
]

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('da-DK')
}
</script>

<template>
  <div>
    <!-- For Opgave/Task type egenkontrol -->
    <div v-if="item.type === 'Opgave'">
      <div class="simple-content">
        <div class="detail-row">
          <span class="detail-label">Udføres:</span>
          <span>{{ item.frequency || 'Ugentlig' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ansvarlige brugere:</span>
          <span>{{ item.responsibleUsers?.join(', ') || 'Christian Hansen' }}</span>
        </div>

        <div class="detail-section">
          <div v-for="(reminder, index) in item.reminders || defaultReminders" :key="index" class="detail-row">
            <span class="detail-label">Påmindelse:</span>
            <span>{{ reminder.description || reminder }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- For standard Egenkontrol type -->
    <div v-else>
      <div v-if="item.description" class="description">
        {{ item.description }}
      </div>

      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Udføres ugentlig</span>
        </div>
        <div v-if="item.startDate" class="detail-row">
          <span>Starter d.</span>
          <span>{{ formatDate(item.startDate) }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-row">
          <span v-if="item.standard" class="detail-label">{{ item.standard }} - {{ item.standardTitle }}</span>
        </div>
        <div class="detail-row">
          <span>{{ item.enheder }}</span>
        </div>
      </div>

      <!-- Separate checklist section -->
      <div v-if="item.checkliste" class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Tjekliste:</span>
        </div>
        <div class="detail-row">
          <span>{{ item.checkliste }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Ansvarlige brugere:</span>
        </div>
        <div class="detail-row user-row">
          <span>{{ item.responsibleUsers?.join(', ') || 'Christian Hansen' }}</span>
        </div>
        <div class="detail-row" v-if="item.bodyText">
          <span>{{ item.bodyText }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Påmindelser:</span>
        </div>
        <div v-for="(reminder, index) in item.reminders || defaultReminders" :key="index" class="detail-row">
          <span>{{ reminder.description || reminder }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">Notifikationsmodtagere:</span>
        </div>
        <div v-for="(modtager, index) in item.modtagere" :key="`modtager-${index}`" class="detail-row">
          <span>{{ modtager }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.detail-label {
  font-size: $body-1-font-size;
  line-height: $body-1-line-height;
  font-weight: $body-1-font-weight-semibold;
  color: $neutral-900;
  margin-bottom: 4px;
}

.description {
  margin-bottom: 20px;
  line-height: 1.5;
}

.detail-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.detail-row {
  margin-bottom: 8px;

  &.user-row {
    margin-top: -4px;
  }
}
</style>
