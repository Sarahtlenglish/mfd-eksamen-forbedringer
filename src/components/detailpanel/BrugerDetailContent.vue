<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
 <div class="detail-section">
      <div class="location body-1-semibold">Arbejdsfunktioner</div>
      <p>{{ item.role }}</p>
      <div class="detail-row">
        <p>Ansvarlig for</p>
        <span>-</span>
        <p>{{ item.ansvarlig_for_egenkontrol }}</p>
    </div>
    <div class="detail-row">
      <p>Nærmeste leder</p>
      <span>-</span>
      <p>{{ item.leder }}</p>
    </div>
 </div>
 <div class="detail-section">
      <div class="location body-1-semibold">Tilhørende Grupper</div>
      <p>{{ item.gruppe }}</p>
 </div>
 <div class="detail-section">
    <div class="location body-1-semibold">Personlige oplysninger</div>
    <div class="detail-row">
      <p>Adresse</p>
      <span>-</span>
      <p>{{ item.adresse }}</p>
    </div>
    <div class="detail-row">
      <p>By</p>
      <span>-</span>
      <p>{{ item.postnummer }} {{ item.by }}</p>
    </div>
 </div>
 <div class="detail-section">
    <div class="location body-1-semibold">Kontakt oplysninger</div>
    <div class="detail-row">
      <p>Email</p>
      <span>-</span>
      <p>{{ item.email }}</p>
    </div>
    <div class="detail-row">
      <p>Telefon</p>
      <span>-</span>
      <p>{{ item.telefon }}</p>
    </div>
 </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.detail-section {
  margin-bottom: 16px;

  .detail-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
}

</style>
