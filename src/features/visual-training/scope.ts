export const pilotExerciseIds = [
  "exercise_bodyweight_squat",
  "exercise_incline_push_up",
  "exercise_one_arm_dumbbell_row",
  "exercise_seated_dumbbell_shoulder_press",
  "exercise_dumbbell_curl",
  "exercise_standing_calf_raise",
] as const;
export const pilotMuscleIds = [
  "muscle_biceps_brachii",
  "muscle_deltoid",
  "muscle_rectus_femoris",
  "muscle_vastus_lateralis",
  "muscle_vastus_medialis",
  "muscle_vastus_intermedius",
  "muscle_gluteus_maximus",
  "muscle_latissimus_dorsi",
  "muscle_pectoralis_major",
  "muscle_triceps_brachii",
  "muscle_gastrocnemius",
  "muscle_soleus",
] as const;
export const isPilotExercise = (id: string) =>
  (pilotExerciseIds as readonly string[]).includes(id);
export const isPilotMuscle = (id: string) =>
  (pilotMuscleIds as readonly string[]).includes(id);
