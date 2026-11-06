import type { ActivityLevel, Goal } from '../lib/calculator'

export interface MealRecipe {
  name: string
  ingredients: string[]
  method: string
  calories: number
}

export interface DailyMenu {
  title: string
  meals: { id: string; label: string; recipe: MealRecipe }[]
  calories: number
  estimatedCost: number
}

export interface Exercise {
  name: string
  duration: string
  sets: string
  reps: string
  rest: string
  guide: string
}

export interface TrainingDay {
  title: string
  type: string
  duration: string
  exercises: Exercise[]
}

const recipes: Record<Goal, Record<string, MealRecipe[]>> = {
  gain: {
    breakfast: [
      { name: 'Nasi telur tempe', ingredients: ['Nasi matang 200 g', 'Telur 2 butir', 'Tempe 50 g', 'Minyak 1 sdt'], method: 'Goreng telur dan tempe dengan sedikit minyak. Sajikan bersama nasi.', calories: 560 },
      { name: 'Oat pisang susu', ingredients: ['Oat 60 g', 'Susu UHT 200 ml', 'Pisang 1 buah', 'Selai kacang 1 sdm'], method: 'Masak oat dengan susu 3-5 menit. Tambahkan pisang dan selai kacang.', calories: 520 },
      { name: 'Roti telur keju', ingredients: ['Roti tawar 3 lembar', 'Telur 2 butir', 'Keju 1 lembar', 'Tomat 1 buah'], method: 'Masak telur dadar, letakkan bersama keju dan tomat di atas roti.', calories: 510 },
      { name: 'Nasi uduk telur', ingredients: ['Nasi matang 200 g', 'Telur rebus 2 butir', 'Tempe 40 g', 'Timun ½ buah'], method: 'Hangatkan nasi dan tempe. Sajikan dengan telur rebus dan timun.', calories: 570 },
      { name: 'Bubur kacang hijau', ingredients: ['Kacang hijau 60 g', 'Santan encer 100 ml', 'Gula 1 sdm', 'Roti tawar 2 lembar'], method: 'Rebus kacang hingga empuk, masukkan santan dan gula. Makan bersama roti.', calories: 500 },
    ],
    lunch: [
      { name: 'Nasi ayam sayur', ingredients: ['Nasi matang 250 g', 'Ayam tanpa kulit 120 g', 'Wortel 50 g', 'Buncis 50 g', 'Minyak 1 sdt'], method: 'Panggang atau tumis ayam. Rebus sayur sebentar dan sajikan dengan nasi.', calories: 680 },
      { name: 'Nasi ikan tempe', ingredients: ['Nasi matang 250 g', 'Ikan kembung 120 g', 'Tempe 50 g', 'Kangkung 100 g'], method: 'Panggang ikan, tumis kangkung, lalu sajikan dengan tempe dan nasi.', calories: 700 },
      { name: 'Nasi telur tahu', ingredients: ['Nasi matang 250 g', 'Telur 2 butir', 'Tahu 100 g', 'Sayur bening 1 mangkuk'], method: 'Dadar telur dan panggang tahu. Sajikan bersama nasi dan sayur bening.', calories: 650 },
      { name: 'Nasi ayam kecap', ingredients: ['Nasi matang 250 g', 'Ayam 120 g', 'Kecap 1 sdm', 'Kol 80 g', 'Minyak 1 sdt'], method: 'Masak ayam dengan kecap dan sedikit air. Sajikan dengan kol dan nasi.', calories: 670 },
      { name: 'Nasi tuna suwir', ingredients: ['Nasi matang 250 g', 'Tuna 100 g', 'Tempe 50 g', 'Tumis sawi 100 g'], method: 'Masak tuna dengan bumbu sederhana, panggang tempe, lalu sajikan dengan sawi.', calories: 660 },
    ],
    dinner: [
      { name: 'Nasi telur dadar sayur', ingredients: ['Nasi matang 200 g', 'Telur 2 butir', 'Bayam 100 g', 'Tahu 80 g'], method: 'Buat telur dadar bayam dan kukus atau panggang tahu. Sajikan dengan nasi.', calories: 590 },
      { name: 'Ubi ayam panggang', ingredients: ['Ubi 250 g', 'Ayam 100 g', 'Sayur bening 1 mangkuk', 'Susu 150 ml'], method: 'Rebus ubi, panggang ayam hingga matang, lalu sajikan dengan sayur dan susu.', calories: 570 },
      { name: 'Nasi tempe tahu', ingredients: ['Nasi matang 200 g', 'Tempe 80 g', 'Tahu 100 g', 'Capcay 1 mangkuk'], method: 'Panggang tempe dan tahu. Sajikan dengan capcay dan nasi.', calories: 600 },
      { name: 'Nasi ikan sayur', ingredients: ['Nasi matang 200 g', 'Ikan nila 120 g', 'Labu siam 100 g', 'Minyak 1 sdt'], method: 'Panggang ikan dan masak labu siam berkuah. Sajikan bersama nasi.', calories: 560 },
      { name: 'Mie telur sayur', ingredients: ['Mie telur 1 porsi (70 g kering)', 'Telur 1 butir', 'Sawi 80 g', 'Ayam suwir 60 g'], method: 'Rebus mie. Tumis sebentar bersama telur, ayam, dan sawi.', calories: 610 },
    ],
    snack: [
      { name: 'Pisang susu kacang', ingredients: ['Pisang 1 buah', 'Susu UHT 200 ml', 'Kacang tanah 15 g'], method: 'Sajikan pisang dan kacang bersama segelas susu.', calories: 300 },
      { name: 'Roti isi telur', ingredients: ['Roti tawar 2 lembar', 'Telur rebus 1 butir', 'Mayones 1 sdt'], method: 'Haluskan telur, campur mayones, lalu oleskan pada roti.', calories: 280 },
      { name: 'Ubi dan susu', ingredients: ['Ubi rebus 180 g', 'Susu UHT 200 ml'], method: 'Rebus ubi sampai empuk, sajikan bersama susu.', calories: 270 },
      { name: 'Yogurt pisang oat', ingredients: ['Yogurt tawar 150 g', 'Pisang ½ buah', 'Oat 20 g'], method: 'Potong pisang dan campur semua bahan dalam mangkuk.', calories: 260 },
      { name: 'Kacang dan buah', ingredients: ['Kacang tanah sangrai 20 g', 'Pepaya 150 g', 'Susu 100 ml'], method: 'Sajikan kacang, pepaya potong, dan susu.', calories: 290 },
    ],
  },
  loss: {
    breakfast: [
      { name: 'Telur dan roti gandum', ingredients: ['Telur 2 butir', 'Roti gandum 2 lembar', 'Tomat 1 buah', 'Susu 150 ml'], method: 'Rebus telur dan sajikan dengan roti, tomat potong, dan susu.', calories: 420 },
      { name: 'Oat pisang sederhana', ingredients: ['Oat 40 g', 'Susu rendah lemak 200 ml', 'Pisang 1 buah', 'Telur rebus 1 butir'], method: 'Masak oat dengan susu 3-5 menit. Tambahkan pisang dan nikmati bersama telur.', calories: 410 },
      { name: 'Nasi telur sayur', ingredients: ['Nasi matang 150 g', 'Telur 2 butir', 'Bayam 100 g', 'Minyak ½ sdt'], method: 'Buat telur dadar bayam dengan sedikit minyak dan sajikan bersama nasi.', calories: 420 },
      { name: 'Ubi telur rebus', ingredients: ['Ubi rebus 200 g', 'Telur rebus 2 butir', 'Tempe 40 g', 'Timun ½ buah'], method: 'Rebus ubi dan telur hingga matang. Panggang tempe dan sajikan dengan timun.', calories: 420 },
      { name: 'Tahu orak-arik', ingredients: ['Tahu 120 g', 'Telur 2 butir', 'Sawi 80 g', 'Nasi matang 150 g'], method: 'Hancurkan tahu, masak bersama telur dan sawi. Sajikan dengan nasi.', calories: 420 },
    ],
    lunch: [
      { name: 'Nasi ayam lalap', ingredients: ['Nasi matang 200 g', 'Ayam tanpa kulit 120 g', 'Tempe 40 g', 'Timun dan kol 150 g', 'Minyak ½ sdt'], method: 'Panggang ayam dan tempe. Sajikan dengan nasi serta lalap.', calories: 560 },
      { name: 'Nasi tempe sayur', ingredients: ['Nasi matang 200 g', 'Tempe 80 g', 'Telur 1 butir', 'Tumis kangkung 150 g', 'Minyak ½ sdt'], method: 'Panggang tempe, rebus telur, lalu sajikan dengan kangkung dan nasi.', calories: 560 },
      { name: 'Sup ikan dan nasi', ingredients: ['Nasi matang 180 g', 'Ikan 120 g', 'Tahu 80 g', 'Wortel dan kol 150 g'], method: 'Rebus ikan, tahu, dan sayur dengan bawang serta air. Sajikan dengan nasi.', calories: 540 },
      { name: 'Nasi tahu telur', ingredients: ['Nasi matang 180 g', 'Tahu 120 g', 'Telur 1 butir', 'Sayur bening 1 mangkuk'], method: 'Kukus atau panggang tahu, rebus telur, lalu sajikan dengan nasi dan sayur.', calories: 540 },
      { name: 'Gado-gado sederhana', ingredients: ['Sayur rebus 200 g', 'Tahu 100 g', 'Tempe 50 g', 'Telur 1 butir', 'Bumbu kacang 1 sdm', 'Lontong 180 g'], method: 'Rebus sayuran dan tata bersama tahu, tempe, telur, lontong, serta bumbu secukupnya.', calories: 560 },
    ],
    dinner: [
      { name: 'Sup ayam sayur', ingredients: ['Ayam 100 g', 'Kentang 180 g', 'Wortel dan kol 150 g', 'Nasi matang 100 g'], method: 'Rebus ayam hingga matang, masukkan kentang dan sayur sampai empuk. Sajikan dengan nasi.', calories: 490 },
      { name: 'Nasi ikan dan lalap', ingredients: ['Nasi matang 180 g', 'Ikan panggang 120 g', 'Tempe 40 g', 'Timun dan tomat 150 g'], method: 'Panggang ikan dan tempe dengan bumbu sederhana, sajikan dengan nasi dan lalap.', calories: 500 },
      { name: 'Tumis tahu tempe', ingredients: ['Tahu 120 g', 'Tempe 60 g', 'Telur 1 butir', 'Sawi 150 g', 'Nasi matang 150 g', 'Minyak ½ sdt'], method: 'Tumis tahu, tempe, dan sawi dengan sedikit minyak. Sajikan bersama telur dan nasi.', calories: 520 },
      { name: 'Telur kuah sayur', ingredients: ['Telur 2 butir', 'Bayam 150 g', 'Jagung 80 g', 'Nasi matang 180 g'], method: 'Masak telur dan sayur dalam kuah bening. Sajikan bersama nasi.', calories: 500 },
      { name: 'Pecel sayur dan tahu', ingredients: ['Sayur rebus 200 g', 'Tahu 120 g', 'Tempe 40 g', 'Bumbu kacang 1 sdm', 'Nasi matang 150 g'], method: 'Rebus sayur, panggang tahu dan tempe, lalu sajikan dengan nasi serta bumbu secukupnya.', calories: 520 },
    ],
    snack: [
      { name: 'Pepaya dan yogurt', ingredients: ['Pepaya 150 g', 'Yogurt tawar 150 g', 'Oat 15 g'], method: 'Potong pepaya dan campur dengan yogurt serta oat.', calories: 220 },
      { name: 'Pisang dan susu', ingredients: ['Pisang 1 buah sedang', 'Susu rendah lemak 200 ml'], method: 'Cuci pisang dan sajikan bersama segelas susu.', calories: 220 },
      { name: 'Telur, timun, dan roti', ingredients: ['Telur rebus 1 butir', 'Timun ½ buah', 'Roti gandum 1 lembar'], method: 'Rebus telur hingga matang, sajikan dengan timun dan roti.', calories: 210 },
      { name: 'Jagung dan kacang', ingredients: ['Jagung manis 1 buah kecil', 'Kacang tanah sangrai 10 g'], method: 'Rebus jagung dan sajikan dengan kacang sangrai.', calories: 210 },
      { name: 'Jambu dan yogurt', ingredients: ['Jambu biji 1 buah sedang', 'Yogurt tawar 100 g'], method: 'Cuci dan potong jambu, sajikan bersama yogurt.', calories: 200 },
    ],
  },
}

const mealCostBase: Record<Goal, Record<string, number>> = {
  gain: { breakfast: 6500, lunch: 9000, dinner: 8000, snack: 3500 },
  loss: { breakfast: 5000, lunch: 7000, dinner: 6500, snack: 3000 },
}

const ingredientCost: Record<string, number> = {
  ayam: 5000,
  ikan: 6000,
  tuna: 6500,
  telur: 2500,
  tempe: 2500,
  tahu: 2000,
  susu: 3500,
  yogurt: 4000,
  oat: 2500,
  kacang: 2500,
  keju: 3500,
}

export function estimateRecipeCost(goal: Goal, mealId: string, recipe: MealRecipe): number {
  const ingredientText = recipe.ingredients.join(' ').toLowerCase()
  const addedCost = Object.entries(ingredientCost).reduce(
    (total, [ingredient, cost]) => total + (ingredientText.includes(ingredient) ? cost : 0),
    0,
  )
  return (mealCostBase[goal][mealId] ?? 5000) + addedCost
}

export function getMealAlternatives(
  goal: Goal,
  mealId: string,
  currentRecipe: string,
  preferredIngredients: string[],
  excludedIngredients: string[],
): MealRecipe[] {
  const options = recipes[goal][mealId] ?? []
  return options
    .filter((recipe) => recipe.name !== currentRecipe)
    .filter((recipe) => !excludedIngredients.some((ingredient) =>
      recipe.ingredients.some((item) => item.toLowerCase().includes(ingredient.toLowerCase())),
    ))
    .sort((first, second) => {
      const score = (recipe: MealRecipe) => preferredIngredients.reduce(
        (total, ingredient) => total + (recipe.ingredients.some((item) => item.toLowerCase().includes(ingredient.toLowerCase())) ? 1 : 0),
        0,
      )
      return score(second) - score(first)
    })
}

export function findMealRecipe(goal: Goal, mealId: string, recipeName: string): MealRecipe | undefined {
  return recipes[goal][mealId]?.find((recipe) => recipe.name === recipeName)
}

export function mealFavoriteId(goal: Goal, mealId: string, recipeName: string): string {
  return `${goal}|${mealId}|${encodeURIComponent(recipeName)}`
}

export function resolveMealFavorite(favoriteId: string): { goal: Goal; mealId: string; recipe: MealRecipe } | null {
  const [goal, mealId, ...encodedName] = favoriteId.split('|')
  if ((goal !== 'gain' && goal !== 'loss') || !recipes[goal][mealId]) return null
  try {
    const name = decodeURIComponent(encodedName.join('|'))
    const recipe = recipes[goal][mealId].find((item) => item.name === name)
    return recipe ? { goal, mealId, recipe } : null
  } catch {
    return null
  }
}

const menuNames: Record<Goal, string[]> = {
  gain: ['Menu Rumahan 1', 'Menu Ayam & Tempe', 'Menu Praktis Telur', 'Menu Ikan Lokal', 'Menu Ubi dan Sayur', 'Menu Hemat Protein', 'Menu Nasi Lengkap', 'Menu Oat dan Ayam', 'Menu Tahu Tempe', 'Menu Variasi Lokal'],
  loss: ['Menu Seimbang 1', 'Menu Sayur dan Tempe', 'Menu Ayam Panggang', 'Menu Ikan Berkuah', 'Menu Tahu Telur', 'Menu Hemat 1', 'Menu Sayur Beragam', 'Menu Protein Sederhana', 'Menu Rumahan 2', 'Menu Variasi Lokal'],
}

export const dailyMenus: Record<Goal, DailyMenu[]> = {
  gain: menuNames.gain.map((title, day) => {
    const variation = Math.floor(day / 5)
    const meals = [
      { id: 'breakfast', label: 'Sarapan', recipe: recipes.gain.breakfast[day % 5] },
      { id: 'lunch', label: 'Makan siang', recipe: recipes.gain.lunch[(day * 2 + variation) % 5] },
      { id: 'dinner', label: 'Makan malam', recipe: recipes.gain.dinner[(day * 3 + variation * 2) % 5] },
      { id: 'snack', label: 'Camilan', recipe: recipes.gain.snack[(day * 2 + 1 + variation * 3) % 5] },
    ]
    return {
      title,
      meals,
      calories: meals.reduce((total, meal) => total + meal.recipe.calories, 0),
      estimatedCost: meals.reduce((total, meal) => total + estimateRecipeCost('gain', meal.id, meal.recipe), 0),
    }
  }),
  loss: menuNames.loss.map((title, day) => {
    const variation = Math.floor(day / 5)
    const meals = [
      { id: 'breakfast', label: 'Sarapan', recipe: recipes.loss.breakfast[day % 5] },
      { id: 'lunch', label: 'Makan siang', recipe: recipes.loss.lunch[(day * 2 + variation) % 5] },
      { id: 'dinner', label: 'Makan malam', recipe: recipes.loss.dinner[(day * 3 + variation * 2) % 5] },
      { id: 'snack', label: 'Camilan', recipe: recipes.loss.snack[(day * 2 + 1 + variation * 3) % 5] },
    ]
    return {
      title,
      meals,
      calories: meals.reduce((total, meal) => total + meal.recipe.calories, 0),
      estimatedCost: meals.reduce((total, meal) => total + estimateRecipeCost('loss', meal.id, meal.recipe), 0),
    }
  }),
}

const strengthExercises: Record<string, Exercise> = {
  squat: { name: 'Squat kursi', duration: '5 menit', sets: '3 set', reps: '10-12 kali', rest: '60-90 detik', guide: 'Berdiri selebar bahu di depan kursi. Dorong pinggul ke belakang, tekuk lutut, sentuh kursi perlahan, lalu berdiri.' },
  push: { name: 'Push-up dinding', duration: '5 menit', sets: '3 set', reps: '8-12 kali', rest: '60 detik', guide: 'Berdiri menghadap dinding. Letakkan telapak tangan setinggi dada, tekuk siku mendekat ke dinding, lalu dorong kembali.' },
  row: { name: 'Tarik tas ringan', duration: '6 menit', sets: '3 set', reps: '10-12 kali per sisi', rest: '60 detik', guide: 'Pegang tas ringan, condongkan badan dengan punggung netral, tarik siku ke arah pinggang, lalu turunkan perlahan.' },
  bridge: { name: 'Glute bridge', duration: '5 menit', sets: '3 set', reps: '12-15 kali', rest: '60 detik', guide: 'Berbaring dengan lutut ditekuk. Kencangkan perut, angkat pinggul sampai badan lurus, lalu turunkan terkendali.' },
  hinge: { name: 'Hip hinge dengan tas', duration: '6 menit', sets: '3 set', reps: '10 kali', rest: '90 detik', guide: 'Pegang tas ringan di depan paha. Dorong pinggul ke belakang dengan lutut sedikit menekuk dan punggung netral, lalu berdiri.' },
  calf: { name: 'Calf raise', duration: '4 menit', sets: '3 set', reps: '12-15 kali', rest: '45 detik', guide: 'Berdiri sambil berpegangan pada kursi. Angkat tumit, tahan sebentar, kemudian turunkan perlahan.' },
  press: { name: 'Tekan bahu dengan botol', duration: '5 menit', sets: '3 set', reps: '10 kali', rest: '60 detik', guide: 'Pegang botol air ringan di kedua tangan setinggi bahu. Dorong ke atas tanpa mengunci siku, lalu turunkan.' },
  deadbug: { name: 'Dead bug', duration: '5 menit', sets: '3 set', reps: '8 kali per sisi', rest: '45 detik', guide: 'Berbaring telentang, lutut terangkat. Turunkan satu tumit dan tangan berlawanan perlahan sambil menjaga punggung bawah nyaman.' },
  lunge: { name: 'Split squat berpegangan', duration: '5 menit', sets: '2 set', reps: '8 kali per sisi', rest: '60 detik', guide: 'Berpegangan pada kursi, langkahkan satu kaki ke belakang. Turunkan badan sedikit dengan kedua lutut menekuk, lalu kembali.' },
  walk: { name: 'Jalan santai', duration: '10 menit', sets: '1 set', reps: '10 menit', rest: 'Sesuai kebutuhan', guide: 'Berjalan dengan langkah nyaman dan tetap bisa berbicara. Kurangi tempo bila terasa terlalu berat.' },
}

const activeExercises: Record<string, Exercise> = {
  march: { name: 'Jalan di tempat', duration: '8 menit', sets: '3 set', reps: '2 menit', rest: '45 detik', guide: 'Langkahkan kaki bergantian dan ayunkan tangan santai. Jaga tubuh tegak dan pilih tempo nyaman.' },
  chair: { name: 'Duduk-berdiri dari kursi', duration: '6 menit', sets: '3 set', reps: '10-12 kali', rest: '60 detik', guide: 'Duduk di kursi kokoh. Condongkan badan sedikit ke depan, berdiri, lalu duduk kembali dengan perlahan.' },
  wall: { name: 'Push-up dinding', duration: '5 menit', sets: '3 set', reps: '8-12 kali', rest: '60 detik', guide: 'Letakkan telapak tangan di dinding setinggi dada. Tekuk siku mendekat, lalu dorong kembali.' },
  step: { name: 'Langkah samping', duration: '8 menit', sets: '3 set', reps: '1 menit', rest: '45 detik', guide: 'Langkah ke kanan dan kiri bergantian tanpa melompat. Jaga lutut sedikit menekuk dan gerak tetap ringan.' },
  bridge: strengthExercises.bridge,
  bird: { name: 'Bird-dog', duration: '5 menit', sets: '3 set', reps: '8 kali per sisi', rest: '45 detik', guide: 'Posisi merangkak, luruskan satu tangan dan kaki berlawanan. Jaga pinggul stabil, tahan sebentar, lalu ganti sisi.' },
  knee: { name: 'Angkat lutut bergantian', duration: '6 menit', sets: '3 set', reps: '30 detik', rest: '45 detik', guide: 'Berdiri tegak dan angkat lutut bergantian setinggi yang nyaman. Pegang kursi bila perlu.' },
  stretch: { name: 'Peregangan ringan', duration: '8 menit', sets: '1 set', reps: '20 detik per gerakan', rest: 'Sesuai kebutuhan', guide: 'Regangkan betis, paha, bahu, dan dada perlahan. Tidak perlu memantul atau memaksakan rasa nyeri.' },
  walk: strengthExercises.walk,
  squat: { name: 'Squat kursi', duration: '5 menit', sets: '2 set', reps: '8-10 kali', rest: '60 detik', guide: 'Berdiri di depan kursi, dorong pinggul ke belakang hingga menyentuh kursi, lalu berdiri kembali.' },
}

function makeTraining(goal: Goal, titles: string[], schedules: string[][]): TrainingDay[] {
  const catalog = goal === 'gain' ? strengthExercises : activeExercises
  return titles.map((title, index) => {
    const exercises = schedules[index].map((id) => catalog[id])
    const isRest = exercises.length === 0
    return {
      title,
      type: isRest ? 'Pemulihan' : goal === 'gain' ? 'Latihan kekuatan pemula' : 'Kardio ringan dan kekuatan',
      duration: isRest ? 'Istirahat dan peregangan ringan' : `${exercises.reduce((minutes, exercise) => minutes + Number.parseInt(exercise.duration, 10), 0)} menit`,
      exercises,
    }
  })
}

export const trainingDays: Record<Goal, TrainingDay[]> = {
  gain: makeTraining('gain',
    ['Seluruh tubuh A', 'Kaki dan pinggul', 'Dada dan bahu', 'Pemulihan aktif', 'Seluruh tubuh B', 'Kaki dan inti', 'Istirahat', 'Punggung dan lengan', 'Seluruh tubuh C', 'Peregangan dan pemulihan'],
    [['squat', 'push', 'row'], ['squat', 'bridge', 'calf'], ['push', 'press', 'deadbug'], [], ['hinge', 'row', 'bridge'], ['squat', 'lunge', 'deadbug'], [], ['row', 'press', 'calf'], ['squat', 'push', 'hinge'], []]),
  loss: makeTraining('loss',
    ['Kardio ringan A', 'Kekuatan dasar', 'Jalan dan mobilitas', 'Kardio ringan B', 'Kekuatan seluruh tubuh', 'Pemulihan aktif', 'Jalan santai', 'Kardio ringan C', 'Kekuatan dan keseimbangan', 'Istirahat'],
    [['march', 'step', 'stretch'], ['chair', 'wall', 'bridge'], ['walk', 'stretch'], ['march', 'knee', 'step'], ['chair', 'wall', 'bird'], ['stretch'], ['walk'], ['step', 'knee', 'stretch'], ['chair', 'bird', 'bridge'], []]),
}

export const trainingProgramNames: Record<Goal, string[]> = {
  gain: ['Fondasi Otot Pemula', 'Kekuatan dengan Beban Rumah', 'Latihan Seluruh Tubuh', 'Fokus Kaki dan Pinggul', 'Fokus Tubuh Bagian Atas', 'Kekuatan Bertahap', 'Gerak Dasar dan Pemulihan', 'Program Tiga Hari Kekuatan', 'Latihan Rumah Seimbang', 'Konsistensi Otot Pemula'],
  loss: ['Gerak Aktif Pemula', 'Kardio Ringan di Rumah', 'Kekuatan dan Jalan', 'Aktif Tanpa Lompatan', 'Kebugaran Bertahap', 'Jalan dan Mobilitas', 'Kardio Ramah Sendi', 'Gerak Harian Seimbang', 'Latihan Seluruh Tubuh Ringan', 'Kebiasaan Aktif Pemula'],
}

export function getTrainingDay(
  goal: Goal,
  dayIndex: number,
  programIndex = 0,
  activity: ActivityLevel = 'light',
): TrainingDay {
  const training = trainingDays[goal][(dayIndex + programIndex) % trainingDays[goal].length]
  if (activity !== 'sedentary' || !training.exercises.length) return training
  const exercises = training.exercises.map((exercise) => {
    const sets = Number.parseInt(exercise.sets, 10)
    return {
      ...exercise,
      sets: Number.isFinite(sets) && sets > 1 ? `${sets - 1} set` : exercise.sets,
      rest: exercise.rest === 'Sesuai kebutuhan' ? exercise.rest : '90 detik',
    }
  })
  const minutes = Number.parseInt(training.duration, 10)
  return {
    ...training,
    duration: Number.isFinite(minutes) ? `${Math.max(10, Math.round(minutes * 0.75))} menit` : training.duration,
    exercises,
  }
}
