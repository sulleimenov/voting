<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QrcodeVue from 'qrcode.vue'

const stats = ref({ use: 0, try: 0, none: 0 })
const voteUrl = window.location.origin
let pollingTimer = null

// Функция для обработки массива данных из API
const processApiData = (data) => {
  const newStats = { use: 0, try: 0, none: 0 }
  
  data.forEach(item => {
    if (item.voice === 1) newStats.use++
    else if (item.voice === 2) newStats.try++
    else if (item.voice === 3) newStats.none++
  })
  
  return newStats
}

// Основная функция запроса к API
const fetchVotes = async () => {
  try {
    // Замените URL на ваш реальный эндпоинт
    const response = await fetch('https://6822ee1fb342dce8004fe766.mockapi.io/api/v1/voting')
    const data = await response.json()
    
    const processed = processApiData(data)
    
    // Плавное обновление данных (без резких скачков анимации)
    stats.value = processed
  } catch (error) {
    console.error('Ошибка при загрузке голосов:', error)
  }
}

onMounted(() => {
  // Первый запуск
  fetchVotes()
  
  // Обновляем данные каждые 5 секунд
  pollingTimer = setInterval(fetchVotes, 2000)
})

onUnmounted(() => {
  // Очищаем таймер при уходе со страницы
  if (pollingTimer) clearInterval(pollingTimer)
})

const total = computed(() => stats.value.use + stats.value.try + stats.value.none)

const trafficLight = computed(() => [
  { id: 'use', label: 'Уже применяю', val: stats.value.use, color: 'from-emerald-400 to-green-600', shadow: 'shadow-green-500/40' },
  { id: 'try', label: 'Пробую', val: stats.value.try, color: 'from-orange-300 to-amber-500', shadow: 'shadow-amber-500/40' },
  { id: 'none', label: 'Не применяю', val: stats.value.none, color: 'from-rose-400 to-red-600', shadow: 'shadow-red-500/40' }
])
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] flex items-center justify-center p-8 overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
    <!-- <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div> -->

    <div class="relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-32 bg-white/5 backdrop-blur-xl p-12 lg:p-20 rounded-[4rem] border border-white/10 shadow-2xl">
      
      <div class="flex flex-col gap-10">
        <div v-for="item in trafficLight" :key="item.id" 
             class="flex items-center gap-8 group transition-transform duration-500 hover:scale-105">
          
          <div :class="[item.color, item.shadow, 'w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br shadow-[0_0_40px_-10px] relative overflow-hidden']">
            <div class="absolute top-2 left-1/4 w-1/2 h-1/4 bg-white/30 blur-md rounded-full"></div>
            <span class="text-white text-5xl font-black drop-shadow-md">{{ item.val }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-3xl font-bold text-white/90 tracking-tight">{{ item.label }}</span>
            <div class="h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r" :class="item.color"></div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center">
        <div class="h-32 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block"></div>
        <div class="my-4 text-white/20 font-black text-6xl select-none">{{ total }}</div>
        <div class="h-32 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block"></div>
      </div>

      <div class="flex flex-col items-center">
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div class="relative bg-white p-6 rounded-3xl shadow-2xl">
            <qrcode-vue 
              :value="voteUrl + '/voting'"
              :size="400" 
              level="H" 
              render-as="svg"
              foreground="#0f172a"
            />
          </div>
        </div>

        <div class="mt-10 text-center space-y-2">
          <h3 class="text-white text-2xl font-black tracking-tight uppercase">Голосуй сейчас</h3>
          <p class="text-white/40 text-xs font-light italic">{{ voteUrl }}/votes</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
}
</style>