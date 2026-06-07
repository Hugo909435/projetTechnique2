<template>
  <div>
    <!-- ══════════════════════════════════════════════════════ VUE TUTEUR ══ -->
    <template v-if="authStore.isTutor">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes visites</h1>

      <div class="flex gap-6">
        <!-- Colonne gauche : formateurs -->
        <div class="w-60 flex-shrink-0">
          <h2 class="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Mes formateurs</h2>

          <div v-if="loading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <p v-else-if="trainerGroups.length === 0" class="text-sm text-gray-400 italic">Aucun formateur associé.</p>
          <div v-else class="space-y-1.5">
            <button v-for="g in trainerGroups" :key="g.trainerId"
              @click="selectedTrainerId = selectedTrainerId === g.trainerId ? null : g.trainerId"
              class="w-full text-left rounded-xl border px-3 py-2.5 transition-all"
              :class="selectedTrainerId === g.trainerId ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700">
                  {{ g.trainerName.split(' ').map((w: string) => w[0]).join('').toUpperCase() }}
                </div>
                <p class="text-sm font-medium text-gray-800 truncate">{{ g.trainerName }}</p>
              </div>
              <div class="mt-1.5 ml-9">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="trainerGroupBadgeCls(g)">
                  {{ trainerGroupLabel(g) }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Colonne droite : créneaux -->
        <div class="flex-1 min-w-0">
          <p v-if="!selectedTrainerId" class="text-sm text-gray-400 italic pt-2">
            Sélectionnez un formateur pour voir ses créneaux.
          </p>
          <template v-else-if="activeGroup">
            <div v-if="activeGroup.booked" class="mb-5 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
              <p class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                Visite confirmée avec {{ activeGroup.trainerName }}
              </p>
              <p class="text-lg font-bold text-green-900">{{ formatDT(activeGroup.booked.dateTime) }}</p>
              <span class="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full" :class="typeCls(activeGroup.booked.type)">
                {{ activeGroup.booked.typeLabel }}
              </span>
            </div>

            <div v-if="activeGroup.proposed.length">
              <p class="text-sm font-semibold text-gray-700 mb-3">
                {{ activeGroup.booked ? 'Autres créneaux proposés :' : 'Choisissez un créneau :' }}
              </p>
              <div class="space-y-2">
                <div v-for="slot in activeGroup.proposed" :key="slot.id"
                  class="flex items-center justify-between bg-white border border-amber-200 rounded-xl px-5 py-4">
                  <div>
                    <p class="font-medium text-gray-800">{{ formatDT(slot.dateTime) }}</p>
                    <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" :class="typeCls(slot.type)">
                      {{ slot.typeLabel }}
                    </span>
                  </div>
                  <button v-if="!activeGroup.booked" @click="confirm(slot.id)" :disabled="confirming"
                    class="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                    {{ confirming ? '…' : 'Confirmer' }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="!activeGroup.booked && !activeGroup.proposed.length" class="text-sm text-gray-400 italic">
              Aucun créneau proposé par ce formateur pour le moment.
            </p>
          </template>

          <p v-if="actionError" class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{{ actionError }}</p>
        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════════════════════ VUE FORMATEUR ══ -->
    <template v-else-if="authStore.isTrainer">
      <div class="flex gap-6" @click="colorPickerTutorId = null">

        <!-- Colonne gauche : tuteurs -->
        <div class="w-56 flex-shrink-0">
          <h2 class="text-base font-bold text-gray-800 mb-3">Tuteurs</h2>
          <div v-if="tutorsLoading" class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <p v-else-if="tutors.length === 0" class="text-xs text-gray-400 italic">Aucun tuteur associé.</p>
          <div v-else class="space-y-1.5">
            <button v-for="t in tutors" :key="t.id"
              @click="selectedTutor = selectedTutor?.id === t.id ? null : t"
              class="w-full text-left rounded-xl border px-3 py-2.5 transition-all"
              :class="selectedTutor?.id === t.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  :style="getTutorAvatarStyle(t.id)">
                  {{ initials(t) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ t.firstName }} {{ t.lastName }}</p>
                  <p v-if="t.companyName" class="text-xs text-gray-400 truncate">{{ t.companyName }}</p>
                </div>
                <div class="relative flex-shrink-0">
                  <button @click.stop="toggleColorPicker(t.id)"
                    class="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                    :style="{ backgroundColor: getTutorColor(t.id).dot }"
                    title="Changer la couleur"
                  />
                  <div v-if="colorPickerTutorId === t.id"
                    class="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-4 gap-1.5 w-28"
                    @click.stop
                  >
                    <button v-for="(c, idx) in TUTOR_COLORS" :key="idx"
                      @click.stop="setTutorColor(t.id, idx)"
                      class="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                      :style="{ backgroundColor: c.dot, borderColor: getTutorColorIdx(t.id) === idx ? '#374151' : 'white' }"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-1.5 ml-9">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusBadgeCls(t.visitStatus)">
                  {{ statusLabel(t.visitStatus) }}
                </span>
              </div>
            </button>
          </div>

          <p v-if="selectedTutor" class="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            Cliquez directement sur un créneau <strong>libre</strong> du calendrier pour le proposer à
            <strong>{{ selectedTutor.firstName }}</strong>.
          </p>
          <p v-else class="mt-3 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            Sélectionnez un tuteur pour lui proposer des créneaux.
          </p>
        </div>

        <!-- Colonne droite : calendrier mensuel -->
        <div class="flex-1 min-w-0">
          <!-- Navigation mois -->
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300">
              ← Mois précédent
            </button>
            <h2 class="text-base font-semibold text-gray-800 capitalize">{{ monthLabel }}</h2>
            <button @click="nextMonth" class="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300">
              Mois suivant →
            </button>
          </div>

          <!-- Jours de la semaine -->
          <div class="grid grid-cols-7 mb-1">
            <div v-for="d in ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']" :key="d"
              class="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
              {{ d }}
            </div>
          </div>

          <!-- Grille des jours -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
            <div v-for="cell in calendarCells" :key="cell.date.toISOString()"
              class="bg-white min-h-[90px] p-1.5 flex flex-col"
              :class="cell.isCurrentMonth ? '' : 'opacity-40'"
            >
              <!-- Numéro du jour + bouton + -->
              <div class="flex items-center justify-between mb-1">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  :class="cell.isToday ? 'bg-blue-600 text-white' : 'text-gray-700'"
                >
                  {{ cell.date.getDate() }}
                </span>
                <button
                  @click="openCreate(cell.date)"
                  :disabled="!selectedTutor"
                  class="w-5 h-5 rounded flex items-center justify-center transition-colors text-base leading-none"
                  :class="selectedTutor ? 'text-gray-300 hover:text-blue-600 hover:bg-blue-50 cursor-pointer' : 'text-gray-200 cursor-not-allowed'"
                  title="Ajouter un créneau"
                >
                  +
                </button>
              </div>

              <!-- Créneaux du jour (max 3, puis +N) -->
              <div class="space-y-0.5 flex-1">
                <div v-for="slot in cell.slots.slice(0, 3)" :key="slot.id"
                  @click.stop="onSlotClick(slot)"
                  class="text-xs px-1.5 py-0.5 rounded cursor-pointer truncate font-medium transition-opacity hover:opacity-80"
                  :class="slotPillCls(slot)"
                  :style="slotPillStyle(slot)"
                >
                  <span v-if="slot.status === 'PROPOSED'">⏳</span>
                  <span v-else-if="slot.status === 'BOOKED'">✓</span>
                  <span v-else-if="slot.status === 'CANCELLED'">✕</span>
                  {{ formatTime(slot.dateTime) }} · {{ slot.typeLabel }}
                  <span v-if="slot.status === 'PROPOSED' && slot.proposedToName" class="ml-0.5 opacity-80">· {{ slot.proposedToName.split(' ')[0] }}</span>
                  <span v-else-if="slot.status === 'BOOKED' && slot.bookedByName" class="ml-0.5 opacity-80">· {{ slot.bookedByName.split(' ')[0] }}</span>
                  <span v-else-if="slot.status === 'CANCELLED' && slot.proposedToName" class="ml-0.5 opacity-70">· {{ slot.proposedToName.split(' ')[0] }}</span>
                </div>
                <p v-if="cell.slots.length > 3" class="text-xs text-gray-400 pl-1">
                  +{{ cell.slots.length - 3 }} autre{{ cell.slots.length - 3 > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Erreur action directe -->
          <p v-if="actionError" class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {{ actionError }}
          </p>
          <div v-if="actioning" class="mt-2 text-xs text-blue-500 text-center animate-pulse">Proposition en cours…</div>

          <!-- Légende -->
          <div class="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <span class="w-3 h-2 rounded-sm bg-blue-200 inline-block"></span> Libre
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <span class="w-3 h-2 rounded-sm bg-green-200 inline-block"></span> ✓ Confirmé
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <span class="w-3 h-2 rounded-sm bg-gray-200 inline-block"></span> ✕ Annulé
            </div>
            <div v-for="t in tutors" :key="t.id" class="flex items-center gap-1.5 text-xs text-gray-500">
              <span class="w-3 h-2 rounded-sm inline-block" :style="{ backgroundColor: getTutorColor(t.id).dot }"></span>
              ⏳ {{ t.firstName }} {{ t.lastName }}
            </div>
          </div>
        </div>
      </div>

      <!-- Modal : créer un créneau -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showCreateModal = false">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80">
          <h3 class="text-base font-bold text-gray-800 mb-4">Nouveau créneau</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-gray-600 block mb-1">Date</label>
              <input v-model="createForm.date" type="date" class="input" :min="todayStr" required />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 block mb-1">Heure</label>
              <input v-model="createForm.time" type="time" class="input" required />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 block mb-1">Type</label>
              <select v-model="createForm.type" class="input">
                <option value="PRESENTIEL">Présentiel</option>
                <option value="VISIO">Visio</option>
              </select>
            </div>
            <p v-if="createError" class="text-xs text-red-600">{{ createError }}</p>
          </div>
          <div class="flex gap-2 mt-5">
            <button @click="showCreateModal = false" class="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button @click="submitCreate" :disabled="creating" class="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ creating ? '…' : selectedTutor ? `Créer & proposer à ${selectedTutor.firstName}` : 'Créer le créneau' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal : actions sur un créneau existant -->
      <div v-if="selectedSlot" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="selectedSlot = null">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80">
          <h3 class="text-base font-bold text-gray-800 mb-1">{{ formatDT(selectedSlot.dateTime) }}</h3>
          <span class="text-xs px-2 py-0.5 rounded-full inline-block mb-4" :class="typeCls(selectedSlot.type)">
            {{ selectedSlot.typeLabel }}
          </span>

          <template v-if="selectedSlot.status === 'FREE'">
            <div class="flex gap-2">
              <button @click="selectedSlot = null" class="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              <button @click="deleteSlot" :disabled="actioning"
                class="border border-red-200 text-red-600 rounded-lg py-2 px-3 text-sm hover:bg-red-50 disabled:opacity-50">
                {{ actioning ? '…' : 'Supprimer' }}
              </button>
            </div>
          </template>

          <template v-else-if="selectedSlot.status === 'PROPOSED'">
            <p class="text-sm text-gray-600 mb-4">
              Proposé à <strong>{{ selectedSlot.proposedToName }}</strong> — en attente de confirmation.
            </p>
            <div class="flex gap-2">
              <button @click="selectedSlot = null" class="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              <button @click="cancelPropose" :disabled="actioning"
                class="flex-1 border border-orange-200 text-orange-700 rounded-lg py-2 text-sm hover:bg-orange-50 disabled:opacity-50">
                {{ actioning ? '…' : 'Annuler la proposition' }}
              </button>
            </div>
          </template>

          <template v-else-if="selectedSlot.status === 'CANCELLED'">
            <p class="text-sm text-gray-500 mb-4">
              Ce créneau a été annulé automatiquement — <strong>{{ selectedSlot.proposedToName }}</strong> a choisi un autre créneau.
            </p>
            <div class="flex gap-2">
              <button @click="selectedSlot = null" class="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              <button @click="deleteSlot" :disabled="actioning"
                class="border border-red-200 text-red-600 rounded-lg py-2 px-3 text-sm hover:bg-red-50 disabled:opacity-50">
                {{ actioning ? '…' : 'Supprimer' }}
              </button>
            </div>
          </template>

          <template v-else>
            <p class="text-sm text-gray-600 mb-4">Confirmé par <strong>{{ selectedSlot.bookedByName }}</strong>.</p>
            <button @click="selectedSlot = null" class="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
          </template>

          <p v-if="actionError" class="mt-3 text-xs text-red-600">{{ actionError }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const { visits } = useApi()

// ── State partagé ────────────────────────────────────────────────────────────
const slots         = ref<any[]>([])
const tutors        = ref<any[]>([])
const tutorsLoading = ref(false)
const loading       = ref(false)
const actionError   = ref('')
const confirming    = ref(false)

// ── State tuteur ─────────────────────────────────────────────────────────────
const selectedTrainerId = ref<number | null>(null)

const trainerGroups = computed(() => {
  const map = new Map<number, any>()
  for (const s of slots.value) {
    if (!map.has(s.trainerId))
      map.set(s.trainerId, { trainerId: s.trainerId, trainerName: s.trainerName, proposed: [], booked: null })
    const g = map.get(s.trainerId)
    if (s.status === 'BOOKED')       g.booked = s
    else if (s.status === 'PROPOSED') g.proposed.push(s)
  }
  return [...map.values()].sort((a, b) => a.trainerName.localeCompare(b.trainerName))
})

const activeGroup = computed(() =>
  trainerGroups.value.find(g => g.trainerId === selectedTrainerId.value) ?? null
)

const trainerGroupLabel = (g: any) => {
  if (g.booked)           return 'Confirmé'
  if (g.proposed.length)  return `${g.proposed.length} créneau${g.proposed.length > 1 ? 'x' : ''} proposé${g.proposed.length > 1 ? 's' : ''}`
  return 'Aucun créneau'
}
const trainerGroupBadgeCls = (g: any) =>
  g.booked ? 'bg-green-100 text-green-700' : g.proposed.length ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'

// ── State formateur ──────────────────────────────────────────────────────────
const selectedTutor   = ref<any>(null)
const selectedSlot    = ref<any>(null)
const actioning       = ref(false)
const showCreateModal = ref(false)
const creating        = ref(false)
const createError     = ref('')
const createForm      = reactive({ date: '', time: '09:00', type: 'PRESENTIEL' })
const todayStr        = new Date().toISOString().split('T')[0]

// ── Calendrier mensuel ───────────────────────────────────────────────────────
const now = new Date()
const currentMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1))

const prevMonth = () => { const d = new Date(currentMonth.value); d.setMonth(d.getMonth() - 1); currentMonth.value = d }
const nextMonth = () => { const d = new Date(currentMonth.value); d.setMonth(d.getMonth() + 1); currentMonth.value = d }

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

const calendarCells = computed(() => {
  const year  = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Lundi = 0
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const cells: { date: Date; isCurrentMonth: boolean; isToday: boolean; slots: any[] }[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, isCurrentMonth: false, isToday: false, slots: [] })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const today = new Date()
    cells.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.toDateString() === today.toDateString(),
      slots: [],
    })
  }
  let next = 1
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false, isToday: false, slots: [] })
  }

  // Remplir les créneaux
  for (const slot of slots.value) {
    const key = slot.dateTime.split('T')[0]
    const cell = cells.find(c => c.date.toISOString().split('T')[0] === key)
    if (cell) cell.slots.push(slot)
  }
  // Trier les créneaux dans chaque cellule
  cells.forEach(c => c.slots.sort((a, b) => a.dateTime.localeCompare(b.dateTime)))

  return cells
})

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const formatDT = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

const typeCls = (type: string) =>
  type === 'PRESENTIEL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'

const TUTOR_COLORS = [
  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd', dot: '#8b5cf6' },
  { bg: '#fce7f3', text: '#831843', border: '#f9a8d4', dot: '#ec4899' },
  { bg: '#ccfbf1', text: '#134e4a', border: '#5eead4', dot: '#14b8a6' },
  { bg: '#ffedd5', text: '#7c2d12', border: '#fdba74', dot: '#f97316' },
  { bg: '#cffafe', text: '#164e63', border: '#67e8f9', dot: '#06b6d4' },
  { bg: '#ffe4e6', text: '#881337', border: '#fda4af', dot: '#f43f5e' },
  { bg: '#fef3c7', text: '#78350f', border: '#fcd34d', dot: '#f59e0b' },
  { bg: '#e0e7ff', text: '#312e81', border: '#a5b4fc', dot: '#6366f1' },
]

const tutorColorMap = ref<Map<number, number>>(new Map())

const getTutorColorIdx   = (tutorId: number) => tutorColorMap.value.get(tutorId) ?? 0
const getTutorColor      = (tutorId: number) => TUTOR_COLORS[getTutorColorIdx(tutorId)]
const getTutorPillStyle  = (tutorId: number) => {
  const c = getTutorColor(tutorId)
  return { backgroundColor: c.bg, color: c.text, borderColor: c.border }
}
const getTutorAvatarStyle = (tutorId: number) => {
  const c = getTutorColor(tutorId)
  return { backgroundColor: c.bg, color: c.text }
}
const getTutorDotStyle = (tutorId: number) => ({ backgroundColor: getTutorColor(tutorId).dot })

const colorPickerTutorId = ref<number | null>(null)

const setTutorColor = (tutorId: number, idx: number) => {
  tutorColorMap.value = new Map(tutorColorMap.value).set(tutorId, idx)
  colorPickerTutorId.value = null
}

const toggleColorPicker = (tutorId: number) => {
  colorPickerTutorId.value = colorPickerTutorId.value === tutorId ? null : tutorId
}

watch(tutors, (list) => {
  const map = new Map(tutorColorMap.value)
  list.forEach((t, i) => { if (!map.has(t.id)) map.set(t.id, i % TUTOR_COLORS.length) })
  tutorColorMap.value = map
}, { immediate: true })

const slotPillCls = (slot: any) => {
  if (slot.status === 'FREE')      return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (slot.status === 'BOOKED')    return 'bg-green-100 text-green-800 border border-green-200'
  if (slot.status === 'CANCELLED') return 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
  return 'border'
}

const slotPillStyle = (slot: any) => {
  if (slot.status === 'PROPOSED' && slot.proposedToId)
    return getTutorPillStyle(slot.proposedToId)
  return {}
}

const initials      = (t: any) => `${t.firstName?.[0] ?? ''}${t.lastName?.[0] ?? ''}`.toUpperCase()
const statusLabel   = (s: string) => ({ NONE: 'Aucune visite', PENDING: 'En attente', CONFIRMED: 'Confirmé' }[s] ?? s)
const statusBadgeCls = (s: string) => ({ NONE: 'bg-gray-100 text-gray-500', PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700' }[s] ?? '')
const statusAvatarCls = (s: string) => ({ NONE: 'bg-gray-100 text-gray-600', PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700' }[s] ?? '')

// ── Actions formateur ────────────────────────────────────────────────────────
const openCreate = (day: Date) => {
  if (!selectedTutor.value) {
    actionError.value = 'Sélectionnez d\'abord un tuteur dans la liste de gauche.'
    return
  }
  actionError.value = ''
  createForm.date  = day.toISOString().split('T')[0]
  createForm.time  = '09:00'
  createForm.type  = 'PRESENTIEL'
  createError.value = ''
  showCreateModal.value = true
}

const submitCreate = async () => {
  createError.value = ''
  if (!selectedTutor.value) { showCreateModal.value = false; return }
  if (!createForm.date) { createError.value = 'La date est obligatoire.'; return }
  if (!createForm.time) { createError.value = 'L\'heure est obligatoire.'; return }
  creating.value = true
  try {
    const res = await visits.createSlot({ dateTime: `${createForm.date}T${createForm.time}:00`, type: createForm.type })
    const newSlot = res.data
    slots.value.push(newSlot)
    showCreateModal.value = false

    if (selectedTutor.value) {
      try {
        const proposeRes = await visits.propose(newSlot.id, selectedTutor.value.id)
        updateSlot(proposeRes.data)
        await reloadTutors()
      } catch (e: any) {
        actionError.value = e.response?.data?.message ?? 'Créneau créé mais proposition échouée.'
      }
    }
  } catch (e: any) {
    createError.value = e.response?.data?.message ?? 'Erreur lors de la création.'
  } finally {
    creating.value = false
  }
}

const onSlotClick = (slot: any) => {
  actionError.value = ''
  selectedSlot.value = slot
}

const proposeDirectly = async (slot: any) => {
  if (!selectedTutor.value) return
  actioning.value = true
  try {
    const res = await visits.propose(slot.id, selectedTutor.value.id)
    updateSlot(res.data)
    await reloadTutors()
  } catch (e: any) {
    actionError.value = e.response?.data?.message ?? 'Erreur lors de la proposition.'
  } finally {
    actioning.value = false
  }
}

const propose = async () => {
  if (!selectedSlot.value || !selectedTutor.value) return
  actionError.value = ''; actioning.value = true
  try {
    const res = await visits.propose(selectedSlot.value.id, selectedTutor.value.id)
    updateSlot(res.data); selectedSlot.value = null
    await reloadTutors()
  } catch (e: any) { actionError.value = e.response?.data?.message ?? 'Erreur lors de la proposition.' }
  finally { actioning.value = false }
}

const cancelPropose = async () => {
  if (!selectedSlot.value) return
  actionError.value = ''; actioning.value = true
  try {
    const res = await visits.cancelPropose(selectedSlot.value.id)
    updateSlot(res.data); selectedSlot.value = null
    await reloadTutors()
  } catch (e: any) { actionError.value = e.response?.data?.message ?? 'Erreur lors de l\'annulation.' }
  finally { actioning.value = false }
}

const deleteSlot = async () => {
  if (!selectedSlot.value) return
  actionError.value = ''; actioning.value = true
  try {
    await visits.deleteSlot(selectedSlot.value.id)
    slots.value = slots.value.filter((s: any) => s.id !== selectedSlot.value!.id)
    selectedSlot.value = null
  } catch (e: any) { actionError.value = e.response?.data?.message ?? 'Impossible de supprimer ce créneau.' }
  finally { actioning.value = false }
}

// ── Action tuteur ─────────────────────────────────────────────────────────────
const confirm = async (id: number) => {
  actionError.value = ''; confirming.value = true
  try {
    await visits.confirm(id)
    const refreshed = await visits.slots()
    slots.value = refreshed.data
  } catch (e: any) { actionError.value = e.response?.data?.message ?? 'Erreur lors de la confirmation.' }
  finally { confirming.value = false }
}

const updateSlot = (updated: any) => {
  const idx = slots.value.findIndex((s: any) => s.id === updated.id)
  if (idx !== -1) slots.value[idx] = updated
  else slots.value.push(updated)
}

const reloadTutors = async () => {
  try { const res = await visits.tutors(); tutors.value = res.data } catch {}
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  try { const res = await visits.slots(); slots.value = res.data }
  catch {} finally { loading.value = false }

  if (authStore.isTrainer) {
    tutorsLoading.value = true
    try { const res = await visits.tutors(); tutors.value = res.data }
    catch {} finally { tutorsLoading.value = false }
  }
})
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm;
}
</style>
