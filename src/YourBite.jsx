import React, { useState, useEffect, useMemo, useCallback, createContext, useContext, useRef } from "react";
import {
  Flame, UtensilsCrossed, Activity, Globe, Plus, Camera, Type as TypeIcon,
  Check, X, TrendingUp, Settings as SettingsIcon, ChevronRight, ChevronLeft, ChevronDown,
  Sunrise, Sun, Moon, Cookie, Footprints, Waves, Bike, PersonStanding,
  Lock, Loader2, Pencil, ScanLine, RotateCcw, Dumbbell, Anchor, Zap, Music2,
  RefreshCw, Target, ClipboardList, Image as ImageIcon, PlayCircle, MessageCircle, Send, Trash2, LogOut
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { supabase } from "./lib/supabaseClient";

/* ============================== DESIGN TOKENS ============================== */
const TOKENS = {
  ink: "#22301C",
  inkSoft: "#54604B",
  paper: "#F2F0E2",
  paperRaised: "#FBFAF3",
  line: "#DAD6C2",
  herb: "#3F5D3A",
  herbDeep: "#2B4227",
  saffron: "#D9A441",
  saffronDeep: "#B8862F",
  clay: "#B5533C",
  fig: "#6B4059",
  cream: "#F8F5EC",
};

function injectFonts() {
  if (document.getElementById("nutripath-fonts")) return;
  const link = document.createElement("link");
  link.id = "nutripath-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/* ============================== I18N ============================== */
const DICT = {
  en: {
    dir: "ltr", fontBody: "'Work Sans', sans-serif", fontDisplay: "'Fraunces', serif",
    appName: "YourBite", tagline: "Track every bite",
    nav_today: "Today", nav_reports: "Reports", nav_settings: "Settings",
    onb_title: "Let's set your path", onb_sub: "A few details so we can work out what your body needs.",
    onb_gender: "Gender", onb_male: "Male", onb_female: "Female",
    onb_age: "Age", onb_age_unit: "years",
    onb_weight: "Weight", onb_weight_unit: "kg",
    onb_height: "Height", onb_height_unit: "cm",
    onb_activity: "Activity level",
    act_sedentary: "Sedentary", act_sedentary_d: "Little to no exercise",
    act_light: "Light", act_light_d: "Exercise 1–3 days a week",
    act_moderate: "Moderate", act_moderate_d: "Exercise 3–5 days a week",
    act_active: "Active", act_active_d: "Exercise 6–7 days a week",
    act_very: "Very active", act_very_d: "Hard exercise, physical job",
    onb_goal: "Goal", goal_lose: "Lose weight", goal_maintain: "Maintain weight", goal_gain: "Gain weight",
    goal_lean_gain: "Gain weight (muscle)", goal_lean_gain_sub: "Smaller surplus, higher protein — build muscle with less fat gain",
    goal_recomp: "Gain muscle & lose fat", goal_recomp_sub: "Small deficit, very high protein — body recomposition",
    onb_submit: "Calculate my plan", onb_edit_submit: "Save changes",
    onb_err: "Fill in every field with a realistic number before continuing.",
    today_remaining: "Remaining", today_target: "Daily target", today_consumed: "Eaten", today_burned: "Burned off",
    today_addMeal: "Log a meal", today_addExercise: "Log exercise",
    meal_breakfast: "Breakfast", meal_lunch: "Lunch", meal_dinner: "Dinner", meal_snack: "Snack",
    today_noMeals: "Nothing logged yet.",
    today_over: "You're past today's target.",
    today_overBody: "Log some movement below to work it back, or just carry on — one day doesn't undo a plan.",
    today_closeDay: "Close today", today_closed: "Day closed", today_reopen: "Day's locked in",
    macro_protein: "Protein", macro_carbs: "Carbs", macro_fat: "Fat",
    modal_addMeal: "Log a meal", tab_text: "Describe it", tab_photo: "Snap it",
    meal_type_label: "Which meal?", meal_name_ph: "e.g. grilled chicken with rice",
    meal_estimate: "Estimate calories", meal_estimating: "Estimating…",
    meal_continue: "Continue", meal_adjust_portions: "Adjust the amounts, then estimate calories.",
    meal_photo_take: "Take or choose a photo", meal_photo_retake: "Choose a different photo",
    meal_photo_analyzing: "Looking at your photo…",
    meal_result_edit: "Adjust the numbers if needed, then save.",
    meal_save: "Save meal", cancel: "Cancel",
    meal_ai_fail: "Couldn't estimate that one — enter the numbers yourself below.",
    ex_title: "Log exercise", ex_suggested: "Suggested, based on today's excess",
    ex_minutes: "minutes", ex_burns: "burns about", ex_logOneClick: "Log this",
    ex_manual: "Or log it yourself", ex_type: "Activity", ex_duration: "Duration (minutes)", ex_add: "Add",
    ex_by_duration: "By duration", ex_by_steps: "By steps", ex_steps_label: "Steps",
    ex_steps_est: "≈ {minutes} min · burns about {kcal} kcal",
    ex_walking: "Walking", ex_running: "Running", ex_cycling: "Cycling", ex_swimming: "Swimming",
    ex_where: "Where are you?", ex_tab_home: "At home", ex_tab_gym: "Gym",
    ex_treadmill: "Treadmill", ex_stationaryBike: "Stationary bike", ex_rowing: "Rowing machine",
    ex_weights: "Weight training", ex_jumpRope: "Jump rope", ex_hiit: "Bodyweight HIIT", ex_dancing: "Dancing",
    summary_title: "Today's summary", summary_under: "Right on plan.", summary_close_call: "Close to your target.",
    summary_over: "A bit over target — tomorrow's a fresh start.",
    summary_net: "Net calories", summary_meals: "Meals logged", summary_exercise: "Exercise logged", summary_done: "Done",
    summary_reopen: "Reopen to add more",
    reports_title: "Your progress", reports_7d: "Last 7 days", reports_month: "This month",
    reports_avg: "Average intake", reports_adherence: "Average adherence", reports_days: "Days tracked",
    reports_empty: "Close a few days to start seeing trends here.",
    reports_target_line: "Target", reports_net_bar: "Net calories",
    settings_title: "Settings", settings_language: "Language", settings_profile: "Your profile",
    settings_editProfile: "Edit profile & targets", settings_about: "About YourBite",
    settings_about_body: "YourBite estimates calorie and macro targets using the Mifflin-St Jeor equation. Estimates are guidance, not medical advice.",
    settings_credit: "Developed by Dr. Zheer Nawzad",
    settings_logout: "Log out",
    unit_kcal: "kcal",
    close: "Close",
    cache_frequent: "Your frequent meals", cache_suggestions: "You've logged this before",
    cache_tap: "tap to use instantly", cache_matched: "Matched a saved meal",
    cache_kurdish: "Kurdish dishes", cache_kurdish_matched: "From the Kurdish dish reference",
    cache_library: "Dishes", cache_library_matched: "From the dish library",
    weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fab_meal: "Log a meal", fab_scan: "Live scan", fab_exercise: "Log exercise",
    log_title: "Today's log", log_all: "All", log_meals: "Meals", log_exercise_tab: "Exercise",
    log_empty: "Nothing logged yet.", log_view_future: "You can't log a day that hasn't happened yet.",
    log_delete: "Remove",
    scan_title: "Live scan", scan_point: "Point your camera at your plate and capture",
    scan_capture: "Capture", scan_analyzing: "Identifying what's on your plate…",
    scan_choose: "Take or choose a photo", scan_retake: "Retake",
    scan_add: "Add to log", scan_total: "Selected total", scan_tapHint: "Tap an item to leave it out",
    scan_noSelection: "Select at least one item first.", scan_fail: "Couldn't read that photo — try again.",
    scan_which_meal: "Log these as",
    nav_training: "Training",
    train_setup_title: "Build your program", train_setup_sub: "Tell us your goal and we'll put together a 4-week plan around it.",
    train_experience: "Experience level", train_exp_beginner: "Beginner", train_exp_intermediate: "Intermediate", train_exp_advanced: "Advanced",
    train_equipment: "Where will you train?", train_days: "Which days?", train_days_hint: "Pick your fixed training days",
    train_generate: "Generate my plan", train_generating: "Building your program…",
    train_err_days: "Pick at least one training day first.", train_err_generic: "Couldn't generate a plan — try again.",
    train_week: "Week", train_your_split: "Your split", train_progression: "This week's focus",
    train_sets: "sets", train_reps: "reps", train_meal_ideas: "Meal ideas", train_meal_ideas_sub: "Rotate between these to hit your targets",
    train_meal_day: "Day",
    train_today_workout: "Today's workout", train_mark_complete: "Mark complete", train_workout_completed: "Completed today",
    train_workout_duration_label: "How long was your session? (minutes)", train_meal_add: "Add to today",
    train_regenerate: "Generate a new plan", train_regenerate_confirm: "This replaces your current plan — continue?",
    train_plan_done: "You've completed this 4-week plan — nice work. Ready for the next one?",
    train_started: "Started", train_safety_note: "Guidance only, not a substitute for a trainer or doctor — stop if anything hurts.",
    train_bmi_note: "Based on your height and weight (BMI {bmi}), many coaches would suggest a fat-loss focus first — but BMI can't tell muscle from fat, so this can be misleading for a muscular build. Enter your waist measurement for a more accurate check:",
    train_waist_placeholder: "Waist (cm)", train_waist_save: "Check",
    train_whtr_ok: "Your waist-to-height ratio looks healthy for your build — muscle-building is a reasonable goal.",
    train_whtr_note: "Based on your waist-to-height ratio ({ratio}), many coaches would suggest starting with a fat-loss focus before a muscle-building phase — you can still choose either.",
    train_focus: "Focus area (optional)", train_focus_hint: "Pick as many as you like — we'll push those areas harder in your program.",
    train_focus_whole: "Whole body", train_focus_shoulders: "Shoulders", train_focus_arms: "Arms",
    train_focus_chest: "Chest", train_focus_back: "Back", train_focus_core: "Core / Abs", train_focus_legs: "Legs & Glutes",
    train_focus_badge: "Extra focus",
    train_watch_how: "Watch how it's done",
    train_meal_sized_to: "Sized to", train_per_day: "day",
    train_swap_action: "Swap this exercise", train_swap_title: "Swap exercise",
    train_swap_sub: "Alternatives for", train_swap_loading: "Finding alternatives…",
    train_swap_fail: "Couldn't load alternatives — try again.",
    train_swap_meal_action: "Swap this meal", train_swap_meal_title: "Swap meal",
    train_meal_style: "Meal style", train_meal_style_mix: "Mix of cuisines", train_meal_style_kurdish: "All Kurdish",
    train_supplement: "Do you use a protein supplement?", train_supplement_none: "No",
    train_supplement_whey: "Whey protein", train_supplement_gainer: "Mass gainer",
    train_supplement_servings: "Servings per day",
    train_supplement_note: "Prefilled with typical values — edit protein/calories per serving to match your product's actual label.",
    train_supplement_protein_label: "Protein/serving (g)", train_supplement_calories_label: "Calories/serving",
    train_chat_title: "Ask your trainer",
    train_chat_disclaimer: "General fitness guidance, not a substitute for a doctor or physical therapist.",
    train_chat_intro: "Ask anything about your plan, exercise form, or nutrition.",
    train_chat_typing: "Typing…", train_chat_placeholder: "Type your question…",
    train_chat_error: "Couldn't get a reply — try again.",
    train_translating: "Updating your plan to match your language…",
    train_supplement_summary: "Plus {servings} × {type}/day (~{protein}g protein, ~{cal} kcal) — the meals below are sized to make up the rest of your ~{totalCal} kcal / {totalProtein}g protein daily total.",
  },
  ar: {
    dir: "rtl", fontBody: "'Noto Kufi Arabic', sans-serif", fontDisplay: "'Noto Kufi Arabic', sans-serif",
    appName: "يور بايت", tagline: "تتبّع كل قضمة",
    nav_today: "اليوم", nav_reports: "التقارير", nav_settings: "الإعدادات",
    onb_title: "لنحدد مسارك", onb_sub: "بعض التفاصيل لنحسب ما يحتاجه جسمك.",
    onb_gender: "الجنس", onb_male: "ذكر", onb_female: "أنثى",
    onb_age: "العمر", onb_age_unit: "سنة",
    onb_weight: "الوزن", onb_weight_unit: "كغم",
    onb_height: "الطول", onb_height_unit: "سم",
    onb_activity: "مستوى النشاط",
    act_sedentary: "خامل", act_sedentary_d: "قليل أو بلا رياضة",
    act_light: "خفيف", act_light_d: "رياضة ١-٣ أيام أسبوعيًا",
    act_moderate: "متوسط", act_moderate_d: "رياضة ٣-٥ أيام أسبوعيًا",
    act_active: "نشيط", act_active_d: "رياضة ٦-٧ أيام أسبوعيًا",
    act_very: "نشيط جدًا", act_very_d: "رياضة شاقة أو عمل بدني",
    onb_goal: "الهدف", goal_lose: "إنقاص الوزن", goal_maintain: "الحفاظ على الوزن", goal_gain: "زيادة الوزن",
    goal_lean_gain: "زيادة الوزن (عضلات)", goal_lean_gain_sub: "فائض أقل وبروتين أعلى — بناء عضلات بدهون أقل",
    goal_recomp: "بناء عضلات وخسارة دهون معًا", goal_recomp_sub: "عجز بسيط وبروتين عالٍ جدًا — إعادة تكوين الجسم",
    onb_submit: "احسب خطتي", onb_edit_submit: "حفظ التغييرات",
    onb_err: "الرجاء تعبئة جميع الحقول بأرقام واقعية قبل المتابعة.",
    today_remaining: "المتبقي", today_target: "الهدف اليومي", today_consumed: "المتناول", today_burned: "المحروق",
    today_addMeal: "تسجيل وجبة", today_addExercise: "تسجيل تمرين",
    meal_breakfast: "فطور", meal_lunch: "غداء", meal_dinner: "عشاء", meal_snack: "وجبة خفيفة",
    today_noMeals: "لم تُسجَّل أي وجبة بعد.",
    today_over: "تجاوزت هدف اليوم.",
    today_overBody: "سجّل بعض النشاط أدناه لتعويضه، أو تابع يومك — يوم واحد لا يُلغي الخطة.",
    today_closeDay: "إغلاق اليوم", today_closed: "أُغلق اليوم", today_reopen: "اليوم مقفل",
    macro_protein: "بروتين", macro_carbs: "كربوهيدرات", macro_fat: "دهون",
    modal_addMeal: "تسجيل وجبة", tab_text: "اكتب وصفها", tab_photo: "صوّرها",
    meal_type_label: "أي وجبة؟", meal_name_ph: "مثال: دجاج مشوي مع أرز",
    meal_estimate: "تقدير السعرات", meal_estimating: "جارٍ التقدير…",
    meal_continue: "متابعة", meal_adjust_portions: "عدّل الكميات، ثم قدّر السعرات.",
    meal_photo_take: "التقط أو اختر صورة", meal_photo_retake: "اختر صورة أخرى",
    meal_photo_analyzing: "جارٍ تحليل صورتك…",
    meal_result_edit: "عدّل الأرقام إذا لزم، ثم احفظ.",
    meal_save: "حفظ الوجبة", cancel: "إلغاء",
    meal_ai_fail: "تعذّر تقدير هذه — أدخل الأرقام بنفسك أدناه.",
    ex_title: "تسجيل تمرين", ex_suggested: "مقترح بحسب فائض اليوم",
    ex_minutes: "دقيقة", ex_burns: "يحرق تقريبًا", ex_logOneClick: "تسجيل",
    ex_manual: "أو سجّله بنفسك", ex_type: "النشاط", ex_duration: "المدة (دقائق)", ex_add: "إضافة",
    ex_by_duration: "حسب المدة", ex_by_steps: "حسب الخطوات", ex_steps_label: "الخطوات",
    ex_steps_est: "≈ {minutes} د · يحرق حوالي {kcal} سعرة",
    ex_walking: "مشي", ex_running: "جري", ex_cycling: "دراجة", ex_swimming: "سباحة",
    ex_where: "أين أنت؟", ex_tab_home: "في المنزل", ex_tab_gym: "الصالة الرياضية",
    ex_treadmill: "جهاز الجري", ex_stationaryBike: "دراجة ثابتة", ex_rowing: "جهاز التجديف",
    ex_weights: "تمارين الأثقال", ex_jumpRope: "نط الحبل", ex_hiit: "تمارين عالية الشدة بوزن الجسم", ex_dancing: "رقص",
    summary_title: "ملخص اليوم", summary_under: "ضمن الخطة تمامًا.", summary_close_call: "قريب جدًا من هدفك.",
    summary_over: "تجاوزت الهدف قليلًا — غدًا بداية جديدة.",
    summary_net: "السعرات الصافية", summary_meals: "الوجبات المسجَّلة", summary_exercise: "التمارين المسجَّلة", summary_done: "تم",
    summary_reopen: "إعادة الفتح لإضافة المزيد",
    reports_title: "تقدّمك", reports_7d: "آخر ٧ أيام", reports_month: "هذا الشهر",
    reports_avg: "متوسط المتناول", reports_adherence: "متوسط الالتزام", reports_days: "أيام مُتابَعة",
    reports_empty: "أغلق بضعة أيام لتبدأ رؤية الاتجاهات هنا.",
    reports_target_line: "الهدف", reports_net_bar: "السعرات الصافية",
    settings_title: "الإعدادات", settings_language: "اللغة", settings_profile: "ملفك",
    settings_editProfile: "تعديل الملف والأهداف", settings_about: "عن يور بايت",
    settings_about_body: "يقدّر يور بايت السعرات والمغذيات الكبرى باستخدام معادلة Mifflin-St Jeor. التقديرات إرشادية وليست استشارة طبية.",
    settings_credit: "تطوير د. زير نوزاد",
    settings_logout: "تسجيل الخروج",
    unit_kcal: "سعرة",
    close: "إغلاق",
    cache_frequent: "وجباتك المتكررة", cache_suggestions: "سبق أن سجّلت هذه",
    cache_tap: "اضغط للاستخدام فورًا", cache_matched: "طابقت وجبة محفوظة",
    cache_kurdish: "أطباق كردية", cache_kurdish_matched: "من مرجع الأطباق الكردية",
    cache_library: "أطباق", cache_library_matched: "من مكتبة الأطباق",
    weekdaysShort: ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"],
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    fab_meal: "تسجيل وجبة", fab_scan: "مسح مباشر", fab_exercise: "تسجيل تمرين",
    log_title: "سجلّ اليوم", log_all: "الكل", log_meals: "الوجبات", log_exercise_tab: "التمارين",
    log_empty: "لم يُسجَّل أي شيء بعد.", log_view_future: "لا يمكنك تسجيل يوم لم يأتِ بعد.",
    log_delete: "إزالة",
    scan_title: "مسح مباشر", scan_point: "وجّه الكاميرا إلى طبقك ثم التقط",
    scan_capture: "التقاط", scan_analyzing: "جارٍ التعرّف على طبقك…",
    scan_choose: "التقط أو اختر صورة", scan_retake: "إعادة الالتقاط",
    scan_add: "إضافة إلى السجل", scan_total: "مجموع المحدَّد", scan_tapHint: "اضغط على عنصر لاستبعاده",
    scan_noSelection: "اختر عنصرًا واحدًا على الأقل.", scan_fail: "تعذّرت قراءة الصورة — حاول مجددًا.",
    scan_which_meal: "سجّلها كـ",
    nav_training: "التدريب",
    train_setup_title: "جهّز برنامجك", train_setup_sub: "أخبرنا هدفك وسنضع لك خطة مدتها 4 أسابيع.",
    train_experience: "مستوى الخبرة", train_exp_beginner: "مبتدئ", train_exp_intermediate: "متوسط", train_exp_advanced: "متقدّم",
    train_equipment: "أين ستتدرب؟", train_days: "أي أيام؟", train_days_hint: "اختر أيام تدريبك الثابتة",
    train_generate: "أنشئ خطتي", train_generating: "جارٍ بناء برنامجك…",
    train_err_days: "اختر يوم تدريب واحدًا على الأقل أولًا.", train_err_generic: "تعذّر إنشاء خطة — حاول مجددًا.",
    train_week: "الأسبوع", train_your_split: "تقسيمتك", train_progression: "تركيز هذا الأسبوع",
    train_sets: "مجموعات", train_reps: "تكرارات", train_meal_ideas: "أفكار وجبات", train_meal_ideas_sub: "بدّل بينها لتحقيق أهدافك",
    train_meal_day: "يوم",
    train_today_workout: "تمرين اليوم", train_mark_complete: "وضع علامة مكتمل", train_workout_completed: "أُنجز اليوم",
    train_workout_duration_label: "كم استغرقت الحصة؟ (دقائق)", train_meal_add: "إضافة لليوم",
    train_regenerate: "إنشاء خطة جديدة", train_regenerate_confirm: "سيستبدل هذا خطتك الحالية — متابعة؟",
    train_plan_done: "أكملت خطة الأسابيع الأربعة — عمل رائع. جاهز للتالية؟",
    train_started: "بدأت في", train_safety_note: "إرشادات عامة فقط، لا تغني عن مدرّب أو طبيب — توقف إذا شعرت بألم.",
    train_bmi_note: "استنادًا إلى طولك ووزنك (مؤشر كتلة الجسم {bmi})، ينصح كثير من المدرّبين بالتركيز على خسارة الدهون أولًا — لكن هذا المؤشر لا يميّز العضلات عن الدهون، لذا قد يكون مضلِّلًا لمن لديه بنية عضلية. أدخل محيط خصرك لفحص أدق:",
    train_waist_placeholder: "محيط الخصر (سم)", train_waist_save: "تحقّق",
    train_whtr_ok: "نسبة محيط خصرك إلى طولك تبدو صحية لبنيتك — بناء العضلات هدف معقول.",
    train_whtr_note: "استنادًا إلى نسبة محيط الخصر إلى الطول ({ratio})، ينصح كثير من المدرّبين بالبدء بالتركيز على خسارة الدهون قبل مرحلة بناء العضلات — ويمكنك اختيار أيٍّ منهما.",
    train_focus: "منطقة التركيز (اختياري)", train_focus_hint: "اختر ما تشاء منها — سنجعل تدريب هذه المناطق أصعب في برنامجك.",
    train_focus_whole: "كامل الجسم", train_focus_shoulders: "الأكتاف", train_focus_arms: "الذراعان",
    train_focus_chest: "الصدر", train_focus_back: "الظهر", train_focus_core: "البطن / المنتصف", train_focus_legs: "الأرجل والمؤخرة",
    train_focus_badge: "تركيز إضافي",
    train_watch_how: "شاهد طريقة الأداء",
    train_meal_sized_to: "مُحدَّد بمقدار", train_per_day: "يوم",
    train_swap_action: "استبدال هذا التمرين", train_swap_title: "استبدال التمرين",
    train_swap_sub: "بدائل لتمرين", train_swap_loading: "جارٍ البحث عن بدائل…",
    train_swap_fail: "تعذّر تحميل البدائل — حاول مجددًا.",
    train_swap_meal_action: "استبدال هذه الوجبة", train_swap_meal_title: "استبدال الوجبة",
    train_meal_style: "نمط الوجبات", train_meal_style_mix: "مزيج من المطابخ", train_meal_style_kurdish: "كردي بالكامل",
    train_supplement: "هل تستخدم مكمّل بروتين؟", train_supplement_none: "لا",
    train_supplement_whey: "بروتين واي (Whey)", train_supplement_gainer: "مكمّل زيادة الوزن (Gainer)",
    train_supplement_servings: "عدد الجرعات يوميًا",
    train_supplement_note: "معبّأة مسبقًا بقيم نموذجية — عدّل البروتين والسعرات لكل جرعة لتطابق ملصق منتجك الفعلي.",
    train_supplement_protein_label: "بروتين/الجرعة (غ)", train_supplement_calories_label: "سعرات/الجرعة",
    train_chat_title: "اسأل مدربك",
    train_chat_disclaimer: "إرشادات لياقة عامة، وليست بديلاً عن طبيب أو أخصائي علاج طبيعي.",
    train_chat_intro: "اسأل أي شيء عن خطتك، أو أداء التمرين، أو التغذية.",
    train_chat_typing: "يكتب…", train_chat_placeholder: "اكتب سؤالك…",
    train_chat_error: "تعذّر الحصول على رد — حاول مجددًا.",
    train_translating: "جارٍ تحديث خطتك لتطابق لغتك…",
    train_supplement_summary: "بالإضافة إلى {servings} × {type}/يوميًا (~{protein}غ بروتين، ~{cal} سعرة) — الوجبات أدناه مُحدَّدة لتكمل باقي إجمالي يومك ~{totalCal} سعرة / {totalProtein}غ بروتين.",
  },
  ckb: {
    dir: "rtl", fontBody: "'Noto Kufi Arabic', sans-serif", fontDisplay: "'Noto Kufi Arabic', sans-serif",
    appName: "یۆر بایت", tagline: "هەموو پارووەیەک بژمێرە",
    nav_today: "ئەمڕۆ", nav_reports: "ڕاپۆرت", nav_settings: "ڕێکخستن",
    onb_title: "با ڕێچکەکەت دیاری بکەین", onb_sub: "چەند زانیارییەک بۆ ئەوەی بزانین لەشت چیی پێویستە.",
    onb_gender: "ڕەگەز", onb_male: "نێر", onb_female: "مێ",
    onb_age: "تەمەن", onb_age_unit: "ساڵ",
    onb_weight: "کێش", onb_weight_unit: "کیلۆگرام",
    onb_height: "باڵا", onb_height_unit: "سانتیمەتر",
    onb_activity: "ئاستی چالاکی",
    act_sedentary: "کەم‌جووڵە", act_sedentary_d: "ڕاهێنانی نییە یان زۆر کەمە",
    act_light: "سووک", act_light_d: "ڕاهێنان ١-٣ ڕۆژ لە هەفتەیەک",
    act_moderate: "مامناوەند", act_moderate_d: "ڕاهێنان ٣-٥ ڕۆژ لە هەفتەیەک",
    act_active: "چالاک", act_active_d: "ڕاهێنان ٦-٧ ڕۆژ لە هەفتەیەک",
    act_very: "زۆر چالاک", act_very_d: "ڕاهێنانی سەخت یان کاری جەستەیی",
    onb_goal: "ئامانج", goal_lose: "کەمکردنەوەی کێش", goal_maintain: "پاراستنی کێش", goal_gain: "زیادکردنی کێش",
    goal_lean_gain: "زیادکردنی کێش (ماسولکە)", goal_lean_gain_sub: "زیادەیەکی کەمتر و پرۆتینی زیاتر — بنیادنانی ماسولکە بە چەوری کەمتر",
    goal_recomp: "بنیادنانی ماسولکە و کەمکردنەوەی چەوری پێکەوە", goal_recomp_sub: "کەمبوونەوەیەکی بچووک و پرۆتینی زۆر بەرز — دووبارە پێکهاتەی لەش",
    onb_submit: "پلانەکەم دەربکەوێت", onb_edit_submit: "پاشەکەوتکردنی گۆڕانکاری",
    onb_err: "تکایە هەموو خانەکان بە ژمارەی ڕاست پڕبکەوە بەر لە بەردەوامبوون.",
    today_remaining: "ماوە", today_target: "ئامانجی ڕۆژانە", today_consumed: "خواردراو", today_burned: "سووتێنراو",
    today_addMeal: "تۆمارکردنی خواردن", today_addExercise: "تۆمارکردنی ڕاهێنان",
    meal_breakfast: "نانی بەیانی", meal_lunch: "نیوەڕۆ", meal_dinner: "شێو", meal_snack: "خواردنی سووک",
    today_noMeals: "هێشتا هیچ خواردنێک تۆمار نەکراوە.",
    today_over: "لە ئامانجی ئەمڕۆ تێپەڕیت.",
    today_overBody: "کەمێک جووڵە لە خوارەوە تۆمار بکە بۆ جوابدانەوەی، یان ڕۆژەکەت بەردەوام بکە — یەک ڕۆژ پلانەکە پووچ ناکاتەوە.",
    today_closeDay: "داخستنی ئەمڕۆ", today_closed: "ڕۆژ داخرا", today_reopen: "ڕۆژەکە قفڵ کراوە",
    macro_protein: "پرۆتین", macro_carbs: "کاربۆهایدرات", macro_fat: "چەوری",
    modal_addMeal: "تۆمارکردنی خواردن", tab_text: "وەسفی بکە", tab_photo: "وێنەی بگرە",
    meal_type_label: "کام خواردن؟", meal_name_ph: "بۆ نموونە: مریشکی برژاو لەگەڵ برنج",
    meal_estimate: "خەمڵاندنی کالۆری", meal_estimating: "خەمڵاندن…",
    meal_continue: "بەردەوامبوون", meal_adjust_portions: "بڕەکان ڕێک بخە، پاشان کالۆری خەمڵێنە.",
    meal_photo_take: "وێنە بگرە یان هەڵبژێرە", meal_photo_retake: "وێنەیەکی تر هەڵبژێرە",
    meal_photo_analyzing: "سەیری وێنەکەت دەکرێت…",
    meal_result_edit: "ئەگەر پێویستە ژمارەکان بگۆڕە، پاشان پاشەکەوتی بکە.",
    meal_save: "پاشەکەوتکردنی خواردن", cancel: "پاشگەزبوونەوە",
    meal_ai_fail: "نەمانتوانی ئەمە خەمڵێنین — ژمارەکان خۆت لە خوارەوە بنووسە.",
    ex_title: "تۆمارکردنی ڕاهێنان", ex_suggested: "پێشنیارکراو، بەپێی زیادەی ئەمڕۆ",
    ex_minutes: "خولەک", ex_burns: "نزیکەی دەسووتێنێت", ex_logOneClick: "تۆماری بکە",
    ex_manual: "یان خۆت تۆماری بکە", ex_type: "چالاکی", ex_duration: "ماوە (خولەک)", ex_add: "زیادکردن",
    ex_by_duration: "بەپێی ماوە", ex_by_steps: "بەپێی هەنگاو", ex_steps_label: "هەنگاو",
    ex_steps_est: "≈ {minutes} خولەک · نزیکەی {kcal} کالۆری دەسووتێنێت",
    ex_walking: "پیاسە", ex_running: "ڕاکردن", ex_cycling: "پاسکیل", ex_swimming: "مەلە",
    ex_where: "لەکوێیت؟", ex_tab_home: "لە ماڵەوە", ex_tab_gym: "یانەی وەرزشی",
    ex_treadmill: "ئامێری ڕاکردن", ex_stationaryBike: "پاسکیلی جێگیر", ex_rowing: "ئامێری سەوڵلێدان",
    ex_weights: "ڕاهێنانی کێش", ex_jumpRope: "بازدانی گوریس", ex_hiit: "ڕاهێنانی توندی ناو بڕ (HIIT)", ex_dancing: "سەما",
    summary_title: "کورتەی ئەمڕۆ", summary_under: "بە تەواوی لەسەر پلانیت.", summary_close_call: "زۆر نزیکی ئامانجەکەیت.",
    summary_over: "کەمێک لە ئامانج تێپەڕیت — سبەی دەستپێکێکی نوێیە.",
    summary_net: "کالۆری ڕەها", summary_meals: "خواردنی تۆمارکراو", summary_exercise: "ڕاهێنانی تۆمارکراو", summary_done: "تەواو",
    summary_reopen: "دووبارە کردنەوە بۆ زیادکردنی زیاتر",
    reports_title: "پێشکەوتنت", reports_7d: "دوایین ٧ ڕۆژ", reports_month: "ئەم مانگە",
    reports_avg: "تێکڕای خواردن", reports_adherence: "تێکڕای پابەندی", reports_days: "ڕۆژە تۆمارکراوەکان",
    reports_empty: "چەند ڕۆژێک داخە بۆ ئەوەی ئاڕاستەکان لێرە ببینیت.",
    reports_target_line: "ئامانج", reports_net_bar: "کالۆری ڕەها",
    settings_title: "ڕێکخستن", settings_language: "زمان", settings_profile: "پرۆفایلت",
    settings_editProfile: "دەستکاریکردنی پرۆفایل و ئامانجەکان", settings_about: "دەربارەی یۆر بایت",
    settings_about_body: "یۆر بایت ئامانجی کالۆری و خۆراکە گەورەکان بە بەکارهێنانی یاسای Mifflin-St Jeor دەخەمڵێنێت. خەمڵاندنەکان ڕێنماییکەرن نەک ڕاوێژی پزیشکی.",
    settings_credit: "دروستکراوە لەلایەن د. ژیر نەوزادەوە",
    settings_logout: "چوونە دەرەوە",
    unit_kcal: "کالۆری",
    close: "داخستن",
    cache_frequent: "خواردنە دووبارەبووەکانت", cache_suggestions: "پێشتر ئەمەت تۆمار کردووە",
    cache_tap: "دەست لێبدە بۆ بەکارهێنانی خێرا", cache_matched: "لەگەڵ خواردنێکی پاشەکەوتکراو هاوتا بوو",
    cache_kurdish: "خواردنی کوردی", cache_kurdish_matched: "لە سەرچاوەی خواردنی کوردییەوە",
    cache_library: "خواردنەکان", cache_library_matched: "لە کتێبخانەی خواردنەکانەوە",
    weekdaysShort: ["٢شەمە", "٣شەمە", "٤شەمە", "٥شەمە", "هەینی", "شەمە", "١شەمە"],
    months: ["ژانویە", "فێبروایە", "مارس", "ئەپریل", "مایس", "حوزەیران", "تەمووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانونی یەکەم"],
    fab_meal: "تۆمارکردنی خواردن", fab_scan: "سکانی ڕاستەوخۆ", fab_exercise: "تۆمارکردنی ڕاهێنان",
    log_title: "تۆماری ئەمڕۆ", log_all: "هەموو", log_meals: "خواردنەکان", log_exercise_tab: "ڕاهێنانەکان",
    log_empty: "هێشتا هیچ شتێک تۆمار نەکراوە.", log_view_future: "ناتوانیت ڕۆژێک تۆمار بکەیت کە هێشتا نەهاتووە.",
    log_delete: "لابردن",
    scan_title: "سکانی ڕاستەوخۆ", scan_point: "کامێرا ڕوو لە پلێتەکەت بگرە و وێنە بگرە",
    scan_capture: "وێنەگرتن", scan_analyzing: "ناسینەوەی ئەوەی لەسەر پلێتەکەتە…",
    scan_choose: "وێنە بگرە یان هەڵبژێرە", scan_retake: "دووبارە وێنەگرتن",
    scan_add: "زیادکردن بۆ تۆمار", scan_total: "کۆی هەڵبژێردراوەکان", scan_tapHint: "دەست لەسەر بکە بۆ لابردنی",
    scan_noSelection: "لانیکەم یەک بەرهەم هەڵبژێرە.", scan_fail: "نەمانتوانی وێنەکە بخوێنینەوە — دووبارە هەوڵ بدە.",
    scan_which_meal: "بیانتۆمارکە وەک",
    nav_training: "ڕاهێنان",
    train_setup_title: "بەرنامەکەت دروست بکە", train_setup_sub: "ئامانجەکەت پێمان بڵێ، ئێمە پلانێکی ٤ هەفتەیی بۆت ڕێک دەخەین.",
    train_experience: "ئاستی شارەزایی", train_exp_beginner: "سەرەتایی", train_exp_intermediate: "مامناوەند", train_exp_advanced: "پێشکەوتوو",
    train_equipment: "لەکوێ ڕاهێنان دەکەیت؟", train_days: "کام ڕۆژەکان؟", train_days_hint: "ڕۆژە جێگیرەکانی ڕاهێنانت هەڵبژێرە",
    train_generate: "پلانەکەم دروست بکە", train_generating: "بەرنامەکەت دروست دەکرێت…",
    train_err_days: "سەرەتا لانیکەم یەک ڕۆژی ڕاهێنان هەڵبژێرە.", train_err_generic: "نەمانتوانی پلانێک دروست بکەین — دووبارە هەوڵ بدە.",
    train_week: "هەفتە", train_your_split: "دابەشکردنی ڕاهێنانت", train_progression: "سەرنجی ئەم هەفتەیە",
    train_sets: "سێت", train_reps: "دووبارەبوونەوە", train_meal_ideas: "بیرۆکەی خواردن", train_meal_ideas_sub: "لەنێوانیاندا بگۆڕە بۆ گەیشتن بە ئامانجەکانت",
    train_meal_day: "ڕۆژی",
    train_today_workout: "ڕاهێنانی ئەمڕۆ", train_mark_complete: "تەواو بکە", train_workout_completed: "ئەمڕۆ تەواو کرا",
    train_workout_duration_label: "ڕاهێنانەکەت چەند خولەک خایاند؟", train_meal_add: "زیادکردن بۆ ئەمڕۆ",
    train_regenerate: "پلانێکی نوێ دروست بکە", train_regenerate_confirm: "ئەمە جێگۆڕکێی پلانی ئێستات دەکات — بەردەوام بیت؟",
    train_plan_done: "پلانی ٤ هەفتەکەت تەواو کرد — کارێکی باش. ئامادەیت بۆ ئەوی داهاتوو؟",
    train_started: "دەستی پێکرد", train_safety_note: "ئەمە تەنها ڕێنمایی گشتییە و جێگرەوەی ڕاهێنەر یان پزیشک نییە — ئەگەر هەستت بە ئازار کرد ڕاوەستە.",
    train_bmi_note: "بەپێی باڵا و کێشت (نمرەی BMI {bmi})، زۆرێک لە ڕاهێنەران پێشنیار دەکەن سەرەتا سەرنج بدەیتە کەمکردنەوەی چەوری — بەڵام BMI ناتوانێت ماسولکە لە چەوری جیا بکاتەوە، بۆیە دەکرێت بۆ کەسێکی ماسولکەدار هەڵە بێت. پێوانەی ناوقەدت بنووسە بۆ پشکنینێکی وردتر:",
    train_waist_placeholder: "ناوقەد (سانتیمەتر)", train_waist_save: "پشکنین",
    train_whtr_ok: "ڕێژەی ناوقەد بۆ باڵات بۆ لەشت تەندروست دیارە — بنیادنانی ماسولکە ئامانجێکی گونجاوە.",
    train_whtr_note: "بەپێی ڕێژەی ناوقەد بۆ باڵا ({ratio})، زۆرێک لە ڕاهێنەران پێشنیار دەکەن سەرەتا سەرنج بدەیتە کەمکردنەوەی چەوری پێش قۆناغی بنیادنانی ماسولکە — هێشتا دەتوانیت هەریەکەیان هەڵبژێریت.",
    train_focus: "ناوچەی سەرنج (ئارەزوومەندانە)", train_focus_hint: "هەرچەندەت پێویستە هەڵیانبژێرە — ڕاهێنانی ئەو بەشانە لە بەرنامەکەتدا زیاتر توند دەکەین.",
    train_focus_whole: "هەموو لەش", train_focus_shoulders: "شان", train_focus_arms: "بازوو",
    train_focus_chest: "سنگ", train_focus_back: "پشت", train_focus_core: "ناوچەی سک", train_focus_legs: "قاچ و سمت",
    train_focus_badge: "سەرنجی زیاتر",
    train_watch_how: "سەیری چۆنیەتی ئەنجامدانی بکە",
    train_meal_sized_to: "ڕێکخراوە بۆ", train_per_day: "ڕۆژ",
    train_swap_action: "گۆڕینی ئەم ڕاهێنانە", train_swap_title: "گۆڕینی ڕاهێنان",
    train_swap_sub: "بژاردەکان بۆ", train_swap_loading: "بژاردە دەدۆزرێتەوە…",
    train_swap_fail: "نەمانتوانی بژاردەکان باربکەین — دووبارە هەوڵ بدە.",
    train_swap_meal_action: "گۆڕینی ئەم خواردنە", train_swap_meal_title: "گۆڕینی خواردن",
    train_meal_style: "شێوازی خواردن", train_meal_style_mix: "تێکەڵەی چێشتلێنان", train_meal_style_kurdish: "بە تەواوی کوردی",
    train_supplement: "ئایا پرۆتینی زیادە بەکاردەهێنیت؟", train_supplement_none: "نەخێر",
    train_supplement_whey: "پرۆتینی وەی (Whey)", train_supplement_gainer: "زیادکەری کێش (Gainer)",
    train_supplement_servings: "ژمارەی ژەم/سکۆپ لە ڕۆژێکدا",
    train_supplement_note: "پێشوەختە پڕکراوەتەوە بە بەهای ئاسایی — پرۆتین و کالۆری بۆ هەر ژەمێک بگۆڕە تاکو لەگەڵ لەیبڵی ڕاستەقینەی بەرهەمەکەت بگونجێت.",
    train_supplement_protein_label: "پرۆتین/ژەم (گ)", train_supplement_calories_label: "کالۆری/ژەم",
    train_chat_title: "پرسیار لە ڕاهێنەرەکەت بکە",
    train_chat_disclaimer: "ڕێنمایی گشتی وەرزشییە، جێگرەوەی پزیشک یان چارەسەرکاری سروشتی نییە.",
    train_chat_intro: "هەر شتێک دەربارەی پلانەکەت، شێوازی ڕاهێنان، یان خۆراک بپرسە.",
    train_chat_typing: "دەنووسێت…", train_chat_placeholder: "پرسیارەکەت بنووسە…",
    train_chat_error: "نەمانتوانی وەڵامێک بەدەستبهێنین — دووبارە هەوڵ بدە.",
    train_translating: "پلانەکەت نوێ دەکرێتەوە بۆ گونجان لەگەڵ زمانەکەت…",
    train_supplement_summary: "سەرباری {servings} × {type}/ڕۆژانە (~{protein}گ پرۆتین، ~{cal} کالۆری) — خواردنەکانی خوارەوە ڕێکخراون بۆ تەواوکردنی کۆی گشتی ڕۆژانەت ~{totalCal} کالۆری / {totalProtein}گ پرۆتین.",
  },
};

const I18nContext = createContext(null);
function useT() { return useContext(I18nContext); }

/* ============================== HELPERS ============================== */
function todayISO(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function isFutureISO(iso) { return iso > todayISO(); }
function getWeekDates(weekOffset) {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now); monday.setDate(now.getDate() - dow + weekOffset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function calcBMR({ gender, age, weight, height }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}
const ACTIVITY_MULT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
const GOAL_ADJUST = { lose: -500, maintain: 0, gain: 300, leanGain: 200, recomp: -150 };
const MACRO_SPLIT = {
  lose: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  leanGain: { protein: 0.35, carbs: 0.40, fat: 0.25 },
  recomp: { protein: 0.40, carbs: 0.35, fat: 0.25 },
};
const SUPPLEMENT_PER_SERVING = {
  whey: { protein: 24, calories: 120 },
  gainer: { protein: 50, calories: 660 },
};
function computeTargets(profile) {
  const bmr = calcBMR(profile);
  const tdee = bmr * ACTIVITY_MULT[profile.activity];
  let target = tdee + GOAL_ADJUST[profile.goal];
  const floor = profile.gender === "male" ? 1500 : 1200;
  target = Math.max(Math.round(target), floor);
  const split = MACRO_SPLIT[profile.goal];
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: target,
    proteinTarget: Math.round((target * split.protein) / 4),
    carbsTarget: Math.round((target * split.carbs) / 4),
    fatTarget: Math.round((target * split.fat) / 9),
  };
}
function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}
function calcWHtR(waistCm, heightCm) {
  if (!waistCm || !heightCm) return null;
  return waistCm / heightCm;
}
const MET = {
  walking: 3.5, running: 8.3, cycling: 6.0, swimming: 6.5,
  treadmill: 7.0, stationaryBike: 7.0, rowingMachine: 7.0, weightTraining: 5.0,
  jumpRope: 10.0, hiit: 8.0, dancing: 5.5,
};
const GYM_TYPES = ["treadmill", "stationaryBike", "rowingMachine", "weightTraining"];
const HOME_TYPES = ["walking", "jumpRope", "hiit", "dancing"];
function burnRatePerMin(type, weightKg) {
  return (MET[type] * 3.5 * weightKg) / 200;
}

/* ============================== STORAGE ============================== */
// Backed by the real Supabase schema (profiles, daily_status, meal_logs,
// exercise_logs, food_cache, training_plans, trainer_chat_messages), each
// scoped to the signed-in user via row-level security.
async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

/* ---- profile (profiles table; row also carries `lang`) ---- */
function profileRowToClient(row) {
  if (!row || row.gender == null) return null; // no row yet, or lang-only row from before onboarding
  return {
    gender: row.gender, age: row.age, weight: row.weight, height: row.height, waist: row.waist,
    activity: row.activity, goal: row.goal, bmr: row.bmr, tdee: row.tdee,
    calorieTarget: row.calorie_target, proteinTarget: row.protein_target,
    carbsTarget: row.carbs_target, fatTarget: row.fat_target,
  };
}
function profileClientToRow(p) {
  return {
    gender: p.gender, age: p.age, weight: p.weight, height: p.height, waist: p.waist ?? null,
    activity: p.activity, goal: p.goal, bmr: p.bmr, tdee: p.tdee,
    calorie_target: p.calorieTarget, protein_target: p.proteinTarget,
    carbs_target: p.carbsTarget, fat_target: p.fatTarget,
  };
}
async function loadProfile() {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) return null;
    return profileRowToClient(data);
  } catch (e) { return null; }
}
async function saveProfile(p) {
  const uid = await getUserId();
  if (!uid) return;
  try {
    await supabase.from("profiles").upsert({ id: uid, ...profileClientToRow(p) }, { onConflict: "id" });
  } catch (e) {}
}
async function loadLang() {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    const { data, error } = await supabase.from("profiles").select("lang").eq("id", uid).maybeSingle();
    if (error || !data) return null;
    return data.lang || null;
  } catch (e) { return null; }
}
async function saveLang(lang) {
  const uid = await getUserId();
  if (!uid) return;
  try { await supabase.from("profiles").upsert({ id: uid, lang }, { onConflict: "id" }); } catch (e) {}
}

/* ---- daily logs (daily_status + meal_logs + exercise_logs) ---- */
function tsToAt(ts) { return ts ? new Date(ts).getTime() : Date.now(); }
function emptyDay() { return { meals: [], exercises: [], closed: false }; }

async function loadLogs() {
  const uid = await getUserId();
  if (!uid) return {};
  try {
    const [mealsRes, exRes, statusRes] = await Promise.all([
      supabase.from("meal_logs").select("*").eq("user_id", uid),
      supabase.from("exercise_logs").select("*").eq("user_id", uid),
      supabase.from("daily_status").select("*").eq("user_id", uid),
    ]);
    const logs = {};
    const dayFor = (date) => (logs[date] || (logs[date] = emptyDay()));
    (mealsRes.data || []).forEach((m) => {
      dayFor(m.date).meals.push({
        id: m.id, type: m.type, name: m.name, calories: m.calories,
        protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0, at: tsToAt(m.logged_at),
      });
    });
    (exRes.data || []).forEach((e) => {
      dayFor(e.date).exercises.push({
        id: e.id, type: e.type, minutes: e.minutes, caloriesBurned: e.calories_burned, at: tsToAt(e.logged_at),
      });
    });
    (statusRes.data || []).forEach((s) => { dayFor(s.date).closed = !!s.closed; });
    return logs;
  } catch (e) { return {}; }
}
async function insertMealRow(dateISO, meal) {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    const { data, error } = await supabase.from("meal_logs").insert({
      user_id: uid, date: dateISO, type: meal.type, name: meal.name,
      calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
      logged_at: new Date(meal.at || Date.now()).toISOString(),
    }).select("id").single();
    if (error) return null;
    return data.id;
  } catch (e) { return null; }
}
async function deleteMealRow(mealId) {
  try { await supabase.from("meal_logs").delete().eq("id", mealId); } catch (e) {}
}
async function insertExerciseRow(dateISO, ex) {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    const { data, error } = await supabase.from("exercise_logs").insert({
      user_id: uid, date: dateISO, type: ex.type, minutes: ex.minutes,
      calories_burned: ex.caloriesBurned, logged_at: new Date(ex.at || Date.now()).toISOString(),
    }).select("id").single();
    if (error) return null;
    return data.id;
  } catch (e) { return null; }
}
async function deleteExerciseRow(exId) {
  try { await supabase.from("exercise_logs").delete().eq("id", exId); } catch (e) {}
}
async function setDayClosed(dateISO, closed) {
  const uid = await getUserId();
  if (!uid) return;
  try {
    await supabase.from("daily_status").upsert({ user_id: uid, date: dateISO, closed }, { onConflict: "user_id,date" });
  } catch (e) {}
}
function normalizeFoodName(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
// Folds Arabic/Kurdish letter variants that look identical but are different Unicode,
// and strips diacritics, so search matches reliably across spelling variants.
function foldForSearch(s) {
  let x = (s || "").toLowerCase();
  x = x.replace(/[\u064B-\u0652\u0670]/g, ""); // Arabic diacritics
  x = x.replace(/[يﻱﻲ]/g, "ی");                // Arabic yeh -> Kurdish/Farsi yeh
  x = x.replace(/[كﻙﻚ]/g, "ک");                // Arabic kaf -> Kurdish keheh
  x = x.replace(/ة/g, "ه");                    // teh marbuta -> heh
  x = x.replace(/[أإآ]/g, "ا");                // alef variants
  x = x.replace(/ۆ/g, "و").replace(/ێ/g, "ی");  // Kurdish o/e -> base
  x = x.replace(/ڵ/g, "ل").replace(/ڕ/g, "ر");  // Kurdish l/r -> base
  x = x.replace(/[^\p{L}\p{N}]+/gu, " ");       // punctuation/parens/spaces -> single space
  return x.trim().replace(/\s+/g, " ");
}
function dishMatchesQuery(dishName, query) {
  const q = foldForSearch(query);
  if (q.length < 2) return false;
  const dWords = foldForSearch(dishName).split(" ");
  const qWords = q.split(" ");
  // every query word must prefix-match some word in the dish name (either direction),
  // so a whole/partial word matches but an unrelated substring does not
  return qWords.every((qw) => qw.length >= 2 && dWords.some((dw) => dw.startsWith(qw) || qw.startsWith(dw)));
}
/* ---- food cache (food_cache table) ---- */
async function loadFoodCache() {
  const uid = await getUserId();
  if (!uid) return {};
  try {
    const { data, error } = await supabase.from("food_cache").select("*").eq("user_id", uid);
    if (error || !data) return {};
    const cache = {};
    data.forEach((r) => {
      cache[r.normalized_name] = {
        name: r.name, calories: r.calories, protein: r.protein || 0, carbs: r.carbs || 0, fat: r.fat || 0,
        count: r.use_count || 0, lastAt: tsToAt(r.last_used_at),
      };
    });
    return cache;
  } catch (e) { return {}; }
}
async function upsertFoodCacheEntry(meal) {
  const uid = await getUserId();
  const key = normalizeFoodName(meal.name);
  if (!uid || !key) return;
  try {
    const { data: existing } = await supabase
      .from("food_cache").select("use_count").eq("user_id", uid).eq("normalized_name", key).maybeSingle();
    await supabase.from("food_cache").upsert({
      user_id: uid, normalized_name: key, name: meal.name,
      calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
      use_count: (existing?.use_count || 0) + 1, last_used_at: new Date().toISOString(),
    }, { onConflict: "user_id,normalized_name" });
  } catch (e) {}
}

/* ---- training plan (training_plans table; one active row per user) ---- */
function planRowToClient(row) {
  if (!row) return null;
  return {
    _id: row.id,
    goal: row.goal, experience: row.experience, equipment: row.equipment,
    weekdays: row.weekdays || [], focusAreas: row.focus_areas || [], mealStyle: row.meal_style,
    contentLang: row.content_lang, splitName: row.split_name, summary: row.summary,
    days: row.days || [], progression: row.progression || [], mealIdeas: row.meal_ideas || [],
    startDate: row.start_date,
    mealCalorieTarget: row.meal_calorie_target, mealProteinTarget: row.meal_protein_target,
    dailyCalorieTarget: row.daily_calorie_target, dailyProteinTarget: row.daily_protein_target,
    supplement: row.supplement, supplementServings: row.supplement_servings,
    supplementProteinPerServing: row.supplement_protein_per_serving,
    supplementCaloriesPerServing: row.supplement_calories_per_serving,
    supplementProtein: Math.round((row.supplement_servings || 0) * (row.supplement_protein_per_serving || 0)),
    supplementCalories: Math.round((row.supplement_servings || 0) * (row.supplement_calories_per_serving || 0)),
  };
}
function planClientToRow(p) {
  return {
    goal: p.goal, experience: p.experience, equipment: p.equipment,
    weekdays: p.weekdays || [], focus_areas: p.focusAreas || [], meal_style: p.mealStyle,
    content_lang: p.contentLang, split_name: p.splitName, summary: p.summary,
    days: p.days || [], progression: p.progression || [], meal_ideas: p.mealIdeas || [],
    start_date: p.startDate,
    meal_calorie_target: p.mealCalorieTarget, meal_protein_target: p.mealProteinTarget,
    daily_calorie_target: p.dailyCalorieTarget, daily_protein_target: p.dailyProteinTarget,
    supplement: p.supplement, supplement_servings: p.supplementServings,
    supplement_protein_per_serving: p.supplementProteinPerServing,
    supplement_calories_per_serving: p.supplementCaloriesPerServing,
  };
}
async function loadTrainingPlan() {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    const { data, error } = await supabase
      .from("training_plans").select("*").eq("user_id", uid).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) return null;
    return planRowToClient(data);
  } catch (e) { return null; }
}
// Updates the existing active plan row in place (exercise/meal swaps, translations);
// only starts a new row (deactivating the old one) the first time a plan is generated.
async function saveTrainingPlan(plan) {
  const uid = await getUserId();
  if (!uid) return null;
  try {
    if (plan._id) {
      const { error } = await supabase.from("training_plans").update(planClientToRow(plan)).eq("id", plan._id);
      if (!error) return plan._id;
    }
    await supabase.from("training_plans").update({ is_active: false }).eq("user_id", uid).eq("is_active", true);
    const { data, error } = await supabase.from("training_plans")
      .insert({ user_id: uid, is_active: true, ...planClientToRow(plan) }).select("id").single();
    if (error) return null;
    return data.id;
  } catch (e) { return null; }
}

/* ---- trainer chat (trainer_chat_messages table) ---- */
async function loadTrainerChat() {
  const uid = await getUserId();
  if (!uid) return [];
  try {
    const { data, error } = await supabase
      .from("trainer_chat_messages").select("*").eq("user_id", uid)
      .order("created_at", { ascending: true }).limit(60);
    if (error || !data) return [];
    return data.slice(-30).map((r) => ({ id: r.id, role: r.role, content: r.content }));
  } catch (e) { return []; }
}
async function insertTrainerMessage(msg) {
  const uid = await getUserId();
  if (!uid) return;
  try { await supabase.from("trainer_chat_messages").insert({ user_id: uid, role: msg.role, content: msg.content }); } catch (e) {}
}

/* ============================== AI CALLS ============================== */
function extractJsonBlock(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

function repairTruncatedItemsJson(text) {
  const key = '"items"';
  const idx = text.indexOf(key);
  if (idx === -1) return null;
  const arrStart = text.indexOf("[", idx);
  if (arrStart === -1) return null;
  let depth = 0, lastGoodEnd = -1;
  for (let i = arrStart; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) lastGoodEnd = i; }
  }
  if (lastGoodEnd === -1) return null;
  try {
    const items = JSON.parse(text.slice(arrStart, lastGoodEnd + 1) + "]");
    return { items };
  } catch (e) { return null; }
}

// Proxied through a Supabase Edge Function (supabase/functions/ai-proxy) so the
// Anthropic API key never reaches the browser. The function forwards the body
// as-is and returns Anthropic's response unchanged, so the parsing below is untouched.
async function callAiProxy(body) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
}

// Kurdish Sorani (ckb) uses Claude Opus, the most capable current model —
// Kurdish is a lower-resource language where the strongest model helps most.
// Everything else stays on the cheaper/faster Haiku.
async function callClaude(content, maxTokens = 500, lang) {
  const isOpus = lang === "ckb";
  const model = isOpus ? "claude-opus-5" : "claude-haiku-4-5-20251001";
  let response;
  try {
    response = await callAiProxy({
      model,
      // Opus's thinking tokens count against max_tokens, so give it headroom.
      max_tokens: isOpus ? maxTokens + 800 : maxTokens,
      ...(isOpus ? { output_config: { effort: "low" } } : {}),
      messages: [{ role: "user", content }],
    });
  } catch (e) {
    throw new Error(`network: ${e.message || e}`);
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`bad response (HTTP ${response.status}): could not parse response body`);
  }
  if (!response.ok) {
    const apiMsg = (data && data.error && data.error.message) || JSON.stringify(data).slice(0, 200);
    throw new Error(`API error (HTTP ${response.status}): ${apiMsg}`);
  }
  const blocks = data.content || [];
  const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!text) {
    throw new Error(`empty response (stop_reason: ${data.stop_reason || "unknown"})`);
  }
  const clean = extractJsonBlock(text.replace(/```json|```/g, "").trim());
  try {
    return JSON.parse(clean);
  } catch (e) {
    const repaired = repairTruncatedItemsJson(clean);
    if (repaired) return repaired;
    throw new Error(`unparseable JSON: ${clean.slice(0, 180)}`);
  }
}

// Shared across every estimation path (text, photo, live scan) so the same
// food and portion always produces the same numbers no matter how it was logged.
const NUTRITION_REFERENCE = `Use these reference values as your baseline, scaling linearly to the exact stated portion — this keeps estimates consistent whether the same food is logged by text, photo, or live scan:
- Chicken breast, grilled/cooked (skinless): 165 kcal, 31g protein, 0g carbs, 3.6g fat per 100g
- Chicken thigh, grilled/cooked (skinless): 209 kcal, 26g protein, 0g carbs, 10.9g fat per 100g
- Beef, lean, cooked: 250 kcal, 26g protein, 0g carbs, 15g fat per 100g
- Lamb, cooked: 294 kcal, 25g protein, 0g carbs, 21g fat per 100g
- Fish (white, grilled): 140 kcal, 26g protein, 0g carbs, 3g fat per 100g
- Salmon, cooked: 208 kcal, 20g protein, 0g carbs, 13g fat per 100g
- Shrimp, cooked: 99 kcal, 24g protein, 0.2g carbs, 0.3g fat per 100g
- White rice, cooked: 130 kcal, 2.7g protein, 28g carbs, 0.3g fat per 100g (1 plate ≈ 200g cooked)
- Bread/flatbread: 265 kcal, 9g protein, 49g carbs, 3.2g fat per 100g
- Pasta, cooked: 131 kcal, 5g protein, 25g carbs, 1.1g fat per 100g
- Potato, cooked: 87 kcal, 2g protein, 20g carbs, 0.1g fat per 100g
- Egg, whole: 78 kcal, 6g protein, 0.6g carbs, 5g fat per large egg (~50g)
- Soup/stew, general: 1 bowl ≈ 300-350ml
For foods not listed here, use your best realistic estimate, but always scale it correctly to the stated portion.`;

// Two-step estimation: first split the description into components with a
// default portion each (so the user can see and correct the assumed amounts
// before any calorie math happens), then compute nutrition from the
// (possibly user-edited) portions.
async function parseMealPortions(foodName, mealType) {
  const prompt = `Break this meal description into its distinct food components for a ${mealType}.
Food: "${foodName}"

For each component, give a realistic default portion using the unit that naturally fits it:
- Meat/protein (chicken, beef, fish, eggs used as a main, etc.): grams — unit "g".
- Rice specifically: always use plates — unit "plate" (never "cup" for rice).
- Pasta, bread-based mains, or other similar starches (not rice): plates — unit "plate" (or "cup" if that fits better).
- Soup or stew: bowls — unit "bowl".
- Drinks (juice, energy drinks, soda, milk, tea): can, glass, or liters, whichever is standard for that drink — unit "can", "glass", or "l".
- Countable items (eggs, bread slices, fruit): count — unit "piece".
If the entry already states a portion or count (e.g. "300g chicken", "2 cans of Red Bull"), use that exact number instead of guessing.

Respond with ONLY compact raw JSON, no markdown, no explanation, in this exact shape:
{"items":[{"name":"short component name","unit":"g","amount":0}]}
List at most 5 components, one per distinct food/drink in the description.`;
  return callClaude(prompt, 500);
}

async function estimateFromPortions(items, mealType) {
  const itemsDesc = items.map((it) => `${it.amount}${it.unit === "g" || it.unit === "l" || it.unit === "ml" ? it.unit : " " + it.unit} of ${it.name}`).join(", ");
  const prompt = `Estimate the total nutrition for a ${mealType} made up of exactly these components and portions: ${itemsDesc}.
${NUTRITION_REFERENCE}
Respond with ONLY a raw JSON object, no markdown, no explanation, in this exact shape:
{"name": "short combined meal name including these portions", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}
Base the numbers on these exact stated portions, not a generic average serving.`;
  return callClaude(prompt, 400);
}

async function estimateCaloriesFromImage(base64Data, mimeType, mealType) {
  const content = [
    { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
    {
      type: "text",
      text: `Identify the food in this photo and estimate its nutrition for a ${mealType}.
${NUTRITION_REFERENCE}
Respond with ONLY a raw JSON object, no markdown, no explanation, in this exact shape:
{"name": "short food name", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}
Use realistic whole numbers based on the visible portion size.`,
    },
  ];
  return callClaude(content);
}

async function estimateItemsFromImage(base64Data, mimeType) {
  const content = [
    { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
    {
      type: "text",
      text: `Look carefully at this plate of food and identify every distinct food item on it separately (e.g. if it's chicken with vegetables, list "chicken", "tomatoes", "corn" as separate items, not one combined item).

For each item's position, this matters a lot — a marker will be drawn at exactly the x,y you give, directly on top of the photo, so it must land ON that specific item and not on a neighboring one:
- Look at where THAT item's own pixels actually are, not where a similar or nearby item is.
- Small or scattered items (corn kernels, herbs, seeds, diced pieces) are easy to mix up with whatever is next to them — find a spot that is clearly and only that item before deciding on x,y.
- Before finalizing each item, double-check: "does this exact x,y sit on top of this food, or did I accidentally point at something else nearby?" Adjust if needed.
- x/y are percentages 0-100 (0,0 = top-left of the photo), marking the center of a visible patch of that item.

Also give a single representative emoji per item.
${NUTRITION_REFERENCE}
Respond with ONLY compact raw JSON, no markdown, no explanation, no extra whitespace, in this exact shape:
{"items":[{"name":"short item name","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"x":0,"y":0,"emoji":"🍗"}]}
List at most 5 items, fewer if the plate is simple. Keep names to 1-3 words. Use realistic whole numbers.`,
    },
  ];
  return callClaude(content, 1200);
}

const WEEKDAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
function todayWeekdayKey() {
  return WEEKDAY_KEYS[(new Date().getDay() + 6) % 7];
}

const FOCUS_AREAS = ["whole", "shoulders", "arms", "chest", "back", "core", "legs"];
const FOCUS_AREA_LABEL_EN = {
  whole: "no particular area — train everything evenly", shoulders: "shoulders", arms: "arms",
  chest: "chest", back: "back", core: "core / abs", legs: "legs and glutes",
};
// Plain-English description of each of the 5 onboarding goals, for AI prompts (not shown in UI directly).
const GOAL_DESC_EN = {
  lose: "lose weight / fat loss with muscle retention",
  maintain: "maintain current weight, general fitness",
  gain: "gain weight and build muscle (moderate surplus)",
  leanGain: "gain weight and build muscle with a lean/controlled surplus, minimizing fat gain",
  recomp: "body recomposition — build muscle and lose fat at the same time, via a small deficit and very high protein",
};
// Maps a goal key to the translation key holding its UI label (for display, not AI prompts).
const GOAL_LABEL_KEY = { lose: "goal_lose", maintain: "goal_maintain", gain: "goal_gain", leanGain: "goal_lean_gain", recomp: "goal_recomp" };

const GOAL_TRAINING_STYLE = {
  lose: "Favor moderate-to-higher rep ranges (10-15) with shorter rest periods, mixing compound lifts with higher-rep accessory work. The calorie deficit is what drives fat loss — training's job here is preserving muscle and keeping metabolic demand reasonably high, not chasing maximal strength.",
  maintain: "Use a balanced mix of rep ranges (8-15) across compound and accessory work. This is general fitness upkeep, not a specialized phase — nothing needs to be pushed to an extreme.",
  gain: "Favor moderate rep ranges (8-12) on compound lifts and slightly higher (10-15) on accessories, with generous overall volume. There's a comfortable calorie surplus to fuel recovery, so more total weekly work is appropriate and well tolerated.",
  leanGain: "Prioritize compound lifts in the 6-10 rep range for strength-and-size efficiency, with accessories in the 8-12 range. Keep volume purposeful rather than maximal — the surplus is smaller than a standard bulk, so every set should earn its place rather than just adding junk volume.",
  recomp: "Prioritize compound lifts in the 6-10 rep range with genuine progressive overload — that's what preserves and builds muscle while in a deficit. Keep total weekly volume moderate rather than high, since recovery capacity is reduced on a deficit, and favor a structure (full-body or upper/lower) where each muscle group still gets trained at least twice a week rather than a very high-frequency body-part split.",
};

async function generateTrainingProgram({ goal, experience, equipment, weekdays, focusAreas, age, lang }) {
  const activeFocus = (focusAreas || []).filter((f) => f && f !== "whole");
  const isFatLossGoal = goal === "lose" || goal === "recomp";
  const separationNote = activeFocus.length > 1
    ? ` These are separate priorities, not a combo — do NOT stack two of them as extra emphasis on the same day (e.g. don't pile extra chest work and extra shoulder work onto one single day, since both are push muscles and that overloads that day). Instead, if the number of training days allows it, give each focus area its own separate day, paired with a complementary group that makes sense (e.g. chest with triceps, shoulders on their own or with a light accessory group, back with biceps) — a classic body-part-split style division across the week is a good fit for this. Only if there genuinely aren't enough training days to separate them should you spread the extra volume thinner across a shared day instead of dropping any of the focus areas.`
    : ``;
  const focusNote = activeFocus.length
    ? `\nThis person specifically wants extra focus on: ${activeFocus.map((f) => FOCUS_AREA_LABEL_EN[f] || f).join(", ")}.${separationNote} This should still be a complete, balanced program that covers the whole body normally with no gaps — don't neglect any other muscle group — but on the day(s) dedicated to each focus area, push it noticeably harder: add 1-2 extra exercises and/or extra sets for it compared to other muscle groups, so it clearly gets more effective, harder training than the rest of the body. ${isFatLossGoal ? "Note: fat loss happens across the whole body from the calorie deficit, not just these areas — but you can still add targeted strengthening/toning work for them." : ""}\n`
    : "";
  const ageNote = age
    ? age >= 50
      ? `\nThis person is ${age} years old. Favor joint-friendly variations and controlled tempos where a lower-impact option exists without sacrificing effectiveness (e.g. leg press or goblet squat alongside/instead of only heavy barbell back squat, machine or cable variations for pressing/pulling where reasonable), and keep the progression notes a bit more conservative week to week.\n`
      : age <= 19
        ? `\nThis person is ${age} years old (a younger trainee). Emphasize solid technique and controlled progression over maximal loading, and keep the exercise selection to well-established, safe movements for someone newer to structured training.\n`
        : `\nThis person is ${age} years old.\n`
    : "";
  const langName = CHAT_LANG_NAMES[lang] || "English";
  const langNote = lang && lang !== "en"
    ? `\nWrite all prose in this response in ${langName} — the splitName, every day's title, every progression note, and the summary. The ONLY exception is the exercise names themselves (the "name" field of each exercise, e.g. "Barbell Bench Press", "Bent-Over Row") — always keep those in English exactly as commonly used in gyms worldwide, even though everything else is in ${langName}, since that's the universal/searchable form people look up.\n`
    : "";
  const ckbVocabNote = lang === "ckb"
    ? `\nUse these exact Kurdish Sorani fitness terms (native speakers flagged the alternatives as wrong, garbled, or unnatural Persian loanwords): "ڕاهێنانی جومگەیی" for a compound exercise (not "تمرینی گشتیکراو"), "دووبارەبوونەوە" for reps (not "دارشتن"), "قەبارە" for training volume (not "حەجم"), "ڕاهێنان" for training/workout (not the Persian loanword "تمرین"). When explaining RPE or "reps in reserve", keep "RPE" and "RIR" as their English acronyms with a short, clear Kurdish explanation around them (e.g. "RPE 7-8" or "٢-٣ دووبارەبوونەوە لە توانادا بمێنێتەوە (RIR)") rather than translating them into an awkward literal phrase.\n`
    : "";
  const goalStyle = GOAL_TRAINING_STYLE[goal] || GOAL_TRAINING_STYLE.maintain;
  const promptText = `You are a certified strength & conditioning coach. Design a repeating weekly workout split for this person:
Goal: ${GOAL_DESC_EN[goal] || goal}
Training approach for this specific goal: ${goalStyle}
Experience level: ${experience}
Where they train: ${equipment === "gym" ? "a full gym with machines and free weights" : "at home with minimal/no equipment (bodyweight, maybe light dumbbells)"}
Training days (fixed weekly schedule): ${weekdays.join(", ")}
${focusNote}${ageNote}${langNote}${ckbVocabNote}
Design ONE workout for each of those training days (a sensible split like push/pull/legs, upper/lower, a body-part split, or full-body depending on the number of days, the goal's training approach above, and any focus areas above), reused every week for 4 weeks with the progression notes below driving intensity changes. Keep each workout to 5-7 exercises, and prefer common, well-known exercise names (e.g. "Barbell Bench Press", "Bent-Over Row", "Leg Press") so they're easy to recognize. Make sure the split as a whole gives complete, well-rounded coverage across the week with no gaps — don't skip muscle groups just because they're smaller: include direct core/abs work (e.g. plank, cable crunch, hanging leg raise) on at least one day, calves on at least one leg day, and some forearm/grip work where it naturally fits (e.g. on a pull or arm day) — fit these in as 1 of the 5-7 exercises on the most relevant day(s) rather than skipping them entirely. Set each exercise's sets/reps to actually match the goal's training approach above, not a generic default. Also give a one-line progression note for each of the 4 weeks that reflects this goal specifically (e.g. how to increase difficulty week to week, with week 4 as a lighter deload week).
Respond with ONLY compact raw JSON, no markdown, no explanation, in this exact shape:
{"splitName":"short name for this split","days":[{"weekday":"monday","title":"short workout title","exercises":[{"name":"exercise name","sets":3,"reps":"8-12"}]}],"progression":[{"week":1,"note":"short note"},{"week":2,"note":"..."},{"week":3,"note":"..."},{"week":4,"note":"..."}],"summary":"1-2 sentence overview of the plan and how to approach it safely"}`;

  return callClaude(promptText, 2200, lang);
}

const KURDISH_MAIN_DISHES = [
  { name: "Brinj u Shlê (برنج و شلە)", portion: "1 plate rice + 1 bowl stew", cal: [550, 680], protein: [25, 35] },
  { name: "Brinj u Bamya (برنج و بامیە)", portion: "1 plate rice + 1 bowl stew", cal: [550, 650], protein: [28, 35] },
  { name: "Brinj u Fasolia (برنج و فاصۆلیا)", portion: "1 plate rice + 1 bowl stew", cal: [600, 700], protein: [32, 40] },
  { name: "Nokaw (نۆکاو / شلەی نۆک)", portion: "1 bowl chickpea soup with lamb shank", cal: [500, 650], protein: [35, 45] },
  { name: "Brinj u Singi Mirîşk (برنج و سنگی مریشک)", portion: "200g chicken breast + 1 plate plain rice", cal: [450, 550], protein: [45, 52] },
  { name: "Brinj u Rani Mirîşk (برنج و ڕانی مریشک)", portion: "1 bone-in thigh/leg + 1 plate rice", cal: [580, 700], protein: [35, 42] },
  { name: "Kfta (کفتەی گۆشت)", portion: "2 large kfta in broth", cal: [500, 650], protein: [28, 36] },
  { name: "Chlfray (چلفرای)", portion: "1 medium plate stir-fried beef/lamb (~250g)", cal: [450, 580], protein: [32, 40] },
  { name: "Goştî Brjaw (گۆشتی برژاو / Grilled Tikka)", portion: "2 skewers (200g meat) + bread", cal: [550, 700], protein: [42, 52] },
  { name: "Balî Brjaw (باڵی برژاو / Grilled Chicken Wings)", portion: "6-8 pieces (250g meat)", cal: [500, 650], protein: [40, 48] },
  { name: "Masî Brjaw (ماسی برژاو / Grilled Fish)", portion: "~500g meat from a whole grilled fish", cal: [750, 950], protein: [90, 110] },
  { name: "Yaprax / Dolma (یەپراخ / دۆڵمە)", portion: "6-8 stuffed veggies/leaves", cal: [650, 850], protein: [22, 30] },
  { name: "Shifta (شفتە)", portion: "3-4 patties + bread", cal: [500, 600], protein: [30, 38] },
  { name: "Chicken Biryani (بریانی مریشک)", portion: "1 large serving plate", cal: [650, 800], protein: [35, 45] },
  { name: "Quzî (قوزی گۆشت)", portion: "1 shank over rice", cal: [850, 1100], protein: [55, 70] },
  { name: "Kubba Boiled (کوبەی کوڵاو)", portion: "2 medium pieces", cal: [400, 500], protein: [20, 25] },
  { name: "Kubba Fried (کوبەی سۆراوە)", portion: "2 medium pieces", cal: [550, 650], protein: [22, 26] },
  { name: "Sawar (ساوار)", portion: "1 medium bowl", cal: [300, 380], protein: [8, 12] },
  { name: "Pacha (پاچە)", portion: "1 full bowl with broth", cal: [900, 1200], protein: [60, 80] },
  { name: "Tashrib (تشریب)", portion: "1 bowl bread + broth + meat", cal: [600, 750], protein: [42, 50] },
];
const KURDISH_BREAKFAST_DISHES = [
  { name: "Helka u Ron (هێلکە و ڕۆن)", portion: "3 fried eggs + 1/2 flatbread", cal: [400, 520], protein: [20, 24] },
  { name: "Mexlemey Sewza (مێخلەمەی سەوزە)", portion: "3-egg herb/veggie omelet + 1/2 bread", cal: [350, 450], protein: [18, 22] },
  { name: "Mexlemey Qîma (مێخلەمەی قیمە)", portion: "3 eggs + 100g minced meat + 1/2 bread", cal: [550, 700], protein: [35, 42] },
  { name: "Panîr u Mreba (پەنیر و مربا)", portion: "60g fresh cheese + 2 tbsp jam + 1/2 bread", cal: [380, 480], protein: [14, 18] },
  { name: "Mast (ماست)", portion: "1 medium bowl (250g)", cal: [150, 180], protein: [8, 10] },
  { name: "Qaymax u Hengwîn (قەیماغ و هەنگوین)", portion: "3 tbsp cream + honey + 1/2 bread", cal: [500, 650], protein: [8, 12] },
  { name: "Nisk (نیسک)", portion: "1 bowl (300ml)", cal: [180, 240], protein: [12, 15] },
  { name: "Kahî (کاهی)", portion: "1 pastry slice", cal: [350, 450], protein: [4, 6] },
  { name: "Panîr u Sewzayî (پەنیر و سەوزایی)", portion: "50g fresh cheese + 1/2 bread", cal: [300, 380], protein: [14, 18] },
];
function formatDishRef(list) {
  return list.map((d) => `${d.name} [${d.portion}: ${d.cal[0]}-${d.cal[1]} kcal, ${d.protein[0]}-${d.protein[1]}g protein]`).join("; ");
}
function estimateMacrosFromCalProtein(calories, proteinG) {
  const proteinCal = proteinG * 4;
  const remaining = Math.max(calories - proteinCal, 0);
  return { carbs: Math.round((remaining * 0.6) / 4), fat: Math.round((remaining * 0.4) / 9) };
}
const ARABIC_DISHES = [
  { name: "Mandi (مندي / Chicken or Lamb Mandi)", portion: "1 plate rice + meat", cal: [650, 900], protein: [40, 55], mealHint: "main" },
  { name: "Kabsa (كبسة)", portion: "1 plate rice + chicken", cal: [600, 850], protein: [38, 50], mealHint: "main" },
  { name: "Maqluba (مقلوبة)", portion: "1 plate", cal: [550, 750], protein: [25, 38], mealHint: "main" },
  { name: "Shawarma Wrap (شاورما)", portion: "1 wrap", cal: [450, 650], protein: [28, 40], mealHint: "main" },
  { name: "Falafel (فلافل)", portion: "5-6 pieces + bread", cal: [400, 550], protein: [14, 20], mealHint: "main" },
  { name: "Hummus w Khubz (حمص وخبز)", portion: "1 bowl hummus + bread", cal: [350, 500], protein: [12, 18], mealHint: "main" },
  { name: "Mansaf (منسف)", portion: "1 plate rice + lamb + jameed", cal: [700, 950], protein: [45, 60], mealHint: "main" },
  { name: "Kibbeh (كبة)", portion: "3-4 pieces", cal: [450, 600], protein: [20, 28], mealHint: "main" },
  { name: "Fattoush Salad (فتوش)", portion: "1 bowl", cal: [180, 280], protein: [5, 8], mealHint: "main" },
  { name: "Tabbouleh (تبولة)", portion: "1 bowl", cal: [150, 250], protein: [4, 7], mealHint: "main" },
  { name: "Grilled Shish Tawook (شيش طاووق)", portion: "2 skewers + rice", cal: [500, 700], protein: [42, 55], mealHint: "main" },
  { name: "Ful Medames (فول مدمس)", portion: "1 bowl + bread", cal: [350, 480], protein: [16, 22], mealHint: "breakfast" },
  { name: "Manakish Zaatar (مناقيش زعتر)", portion: "1 flatbread", cal: [300, 450], protein: [8, 12], mealHint: "breakfast" },
  { name: "Shakshuka (شكشوكة)", portion: "2 eggs in sauce + bread", cal: [350, 500], protein: [18, 24], mealHint: "breakfast" },
  { name: "Labneh w Zaytoun (لبنة وزيتون)", portion: "1 bowl labneh + olives + bread", cal: [300, 420], protein: [12, 16], mealHint: "breakfast" },
];
const COMMON_DISHES = [
  { name: "Grilled Chicken Breast + Rice", portion: "200g breast + 1 cup rice", cal: [450, 550], protein: [45, 52], mealHint: "main" },
  { name: "Grilled Salmon + Veg", portion: "180g salmon + vegetables", cal: [400, 550], protein: [38, 46], mealHint: "main" },
  { name: "Beef Steak + Potatoes", portion: "200g steak + potatoes", cal: [600, 800], protein: [45, 58], mealHint: "main" },
  { name: "Spaghetti Bolognese", portion: "1 plate", cal: [550, 750], protein: [25, 35], mealHint: "main" },
  { name: "Margherita Pizza", portion: "2 slices", cal: [500, 700], protein: [20, 28], mealHint: "main" },
  { name: "Cheeseburger", portion: "1 burger", cal: [500, 750], protein: [25, 35], mealHint: "main" },
  { name: "Caesar Salad + Chicken", portion: "1 bowl", cal: [350, 500], protein: [28, 38], mealHint: "main" },
  { name: "Tuna Sandwich", portion: "1 sandwich", cal: [350, 500], protein: [22, 30], mealHint: "main" },
  { name: "Chicken Shawarma Plate", portion: "1 plate + rice", cal: [550, 750], protein: [40, 52], mealHint: "main" },
  { name: "Lentil Soup + Bread", portion: "1 bowl + bread", cal: [300, 450], protein: [14, 20], mealHint: "main" },
  { name: "Greek Yogurt + Granola", portion: "1 bowl", cal: [300, 420], protein: [18, 24], mealHint: "breakfast" },
  { name: "Oatmeal + Banana + PB", portion: "1 bowl", cal: [350, 480], protein: [12, 18], mealHint: "breakfast" },
  { name: "Scrambled Eggs + Toast", portion: "3 eggs + 2 toast", cal: [350, 480], protein: [20, 26], mealHint: "breakfast" },
  { name: "Protein Smoothie", portion: "1 large glass", cal: [250, 400], protein: [25, 35], mealHint: "breakfast" },
  { name: "Avocado Toast + Egg", portion: "2 slices + 1 egg", cal: [350, 480], protein: [14, 20], mealHint: "breakfast" },
  { name: "Pancakes + Syrup", portion: "3 pancakes", cal: [400, 600], protein: [8, 14], mealHint: "breakfast" },
];
function toLogDishes(list, defaultHint) {
  return list.map((d) => {
    const calories = Math.round((d.cal[0] + d.cal[1]) / 2);
    const protein = Math.round((d.protein[0] + d.protein[1]) / 2);
    const { carbs, fat } = estimateMacrosFromCalProtein(calories, protein);
    return { name: d.name, calories, protein, carbs, fat, mealHint: d.mealHint || defaultHint };
  });
}
const KURDISH_LOG_DISHES = [
  ...toLogDishes(KURDISH_BREAKFAST_DISHES.map((d) => ({ ...d, mealHint: "breakfast" }))),
  ...toLogDishes(KURDISH_MAIN_DISHES.map((d) => ({ ...d, mealHint: "main" }))),
];
const ALL_LOG_DISHES = [
  ...KURDISH_LOG_DISHES,
  ...toLogDishes(ARABIC_DISHES),
  ...toLogDishes(COMMON_DISHES),
];

const GOAL_PROTEIN_NOTE_EN = {
  lose: "Keep protein reasonably high in each meal (lean proteins, eggs, dairy, legumes) to help preserve muscle during the deficit, without making every meal identical.",
  maintain: "Keep a reasonable protein source in each meal for satiety and general health, without needing to maximize it.",
  gain: "This is for muscle building, so protein is a real priority: build every meal around a clear protein source (chicken, fish, eggs, Greek yogurt, cottage cheese, lean beef, tofu, legumes, protein powder) rather than a carb- or fat-heavy meal with protein as an afterthought.",
  leanGain: "Protein is the top priority here even more than a standard bulk — build every meal around a clear protein source, since the surplus is smaller and protein is what ensures the extra calories go toward muscle rather than fat. Each meal should individually contribute a meaningful share of the daily protein target, not just balance out on average.",
  recomp: "Protein is the single most important lever for this goal — this person is in a small deficit while trying to build muscle, and adequate protein in every single meal (not just on average) is what makes that possible. Build every meal around a clear, generous protein source, and don't let any meal be carb/fat-heavy with protein as an afterthought.",
};

async function generateMealIdeas({ goal, calorieTarget, proteinTarget, carbsTarget, fatTarget, mealStyle, lang }) {
  const proteinNote = (GOAL_PROTEIN_NOTE_EN[goal] || GOAL_PROTEIN_NOTE_EN.maintain).replace("the daily protein target", `the ${proteinTarget}g daily protein target`);
  const kurdishRef = `Here is a reference list of real Kurdish dishes with accurate calorie/protein ranges for a standard portion — pick dishes FROM this list (you can scale the portion up or down, and adjust the estimated calories/protein accordingly, to better fit the daily targets) rather than inventing unfamiliar ones or guessing your own numbers for them. Use each dish's name and spelling EXACTLY as given below — do not paraphrase, re-describe, or partially translate a dish name into your own words, since that's what produces garbled results:
BREAKFAST DISHES: ${formatDishRef(KURDISH_BREAKFAST_DISHES)}
LUNCH/DINNER DISHES: ${formatDishRef(KURDISH_MAIN_DISHES)}
For a Kurdish snack, use something simple like tea with dates/nuts, or a cold yogurt-based or fruit drink, estimated reasonably.`;
  const cuisineNote = mealStyle === "kurdish"
    ? `Make ALL THREE sample days Kurdish cuisine — draw on a wide range of different dishes across the three days from the reference list below so they don't repeat.\n\n${kurdishRef}`
    : `Vary the 3 days from each other (different cuisines/styles) so there's variety to rotate through — make one of the three days specifically Kurdish cuisine, drawing on the reference list below.\n\n${kurdishRef}`;
  const langName = CHAT_LANG_NAMES[lang] || "English";
  const langNote = lang && lang !== "en"
    ? `\nWrite everything in ${langName} — the "style" tag for each day (e.g. translate "American-Style" into ${langName}) and every meal idea/description. The dish names from the Kurdish reference list above are already given in Kurdish script — use them as given rather than re-translating those specific names, but write any surrounding description (portion notes, non-Kurdish meal ideas on the other days, etc.) in ${langName} too.\n`
    : "";
  const ckbVocabNote = lang === "ckb"
    ? `\nUse these exact Kurdish Sorani words (native speakers flagged the alternatives as wrong or unnatural): "ئۆملێتی" for omelet (not "نۆمێلێتی"), "برژاو" for grilled (not "بڕژاو"), "هاڕراو" or "قیمە" for minced meat (not "گۆشتی خواردراو"), "قاپ" for a plate/bowl of rice (not the transliterated "دیشک"), "شیش" for a meat skewer (not "سێخ"), "دەنک" for counting dates/grains (not "دەنگ", which means "sound"), "سوورکراوە" for a fried egg (not "سووڕاو", which means "spun/rotated"), "باڵی مریشک" for chicken wings (not "باڵنزی", which isn't a real word), "ملە" for a neck cut of meat (not "ملکە").\n`
    : "";
  const prompt = `You are a nutrition coach. Suggest 3 different realistic sample eating days for someone whose goal is to ${GOAL_DESC_EN[goal] || goal}, with a daily target of about ${calorieTarget} kcal, ${proteinTarget}g protein, ${carbsTarget}g carbs, ${fatTarget}g fat. ${proteinNote} Each sample day should have breakfast, lunch, dinner, and one snack, with simple realistic meal ideas (not recipes) and an estimated calorie count and protein count per meal that adds up close to the daily targets. ${cuisineNote}
${langNote}${ckbVocabNote}
Respond with ONLY compact raw JSON, no markdown, no explanation, in this exact shape:
{"days":[{"style":"short cuisine/style tag only, e.g. American-Style — do NOT include any day number, the app adds that itself","meals":[{"type":"breakfast","idea":"short meal idea","calories":0,"protein_g":0}]}]}
Each day's meals array must have exactly 4 entries with type one of: breakfast, lunch, dinner, snack.`;
  return callClaude(prompt, 1900, lang);
}

async function translatePlanText(plan, targetLang) {
  const langName = CHAT_LANG_NAMES[targetLang] || "English";
  const payload = {
    splitName: plan.splitName || "",
    dayTitles: (plan.days || []).map((d) => d.title || ""),
    progression: (plan.progression || []).map((p) => p.note || ""),
    summary: plan.summary || "",
    mealDayStyles: (plan.mealIdeas || []).map((d) => d.style || ""),
    mealIdeasFlat: (plan.mealIdeas || []).flatMap((d) => (d.meals || []).map((m) => m.idea || "")),
  };
  const prompt = `Translate the text values in this fitness-app JSON data into ${langName}. Rules:
- Translate all prose naturally and fluently into ${langName} — don't leave anything in its original language.
- If a meal idea already names a specific traditional dish by its proper name (e.g. a Kurdish dish name, possibly already in Kurdish script), keep that specific dish name exactly as given rather than translating it — but still translate any surrounding description around it.
- Keep every array the exact same length and order as given, one output string per input string.

INPUT:
${JSON.stringify(payload)}

Respond with ONLY compact JSON, no markdown, no explanation, in this exact shape:
{"splitName":"...","dayTitles":["..."],"progression":["..."],"summary":"...","mealDayStyles":["..."],"mealIdeasFlat":["..."]}`;
  return callClaude(prompt, 2200, targetLang);
}
function applyTranslatedPlanText(plan, translated) {
  const days = (plan.days || []).map((d, i) => ({ ...d, title: (translated.dayTitles && translated.dayTitles[i]) ?? d.title }));
  const progression = (plan.progression || []).map((p, i) => ({ ...p, note: (translated.progression && translated.progression[i]) ?? p.note }));
  let flatIdx = 0;
  const mealIdeas = (plan.mealIdeas || []).map((day, di) => ({
    ...day,
    style: (translated.mealDayStyles && translated.mealDayStyles[di]) ?? day.style,
    meals: (day.meals || []).map((m) => {
      const idea = (translated.mealIdeasFlat && translated.mealIdeasFlat[flatIdx]) ?? m.idea;
      flatIdx++;
      return { ...m, idea };
    }),
  }));
  return {
    ...plan,
    splitName: translated.splitName ?? plan.splitName,
    summary: translated.summary ?? plan.summary,
    days, progression, mealIdeas,
  };
}

async function generateExerciseAlternatives({ exerciseName, equipment }) {
  const prompt = `Suggest 4 alternative exercises that train the same primary muscle group(s) as "${exerciseName}", each one using a noticeably different machine, equipment, or technique than the original (e.g. swap a barbell version for a machine, cable, or dumbbell version, or a different angle/grip). ${equipment === "gym" ? "Assume access to a full gym with machines and free weights." : "Assume home training with minimal or no equipment (bodyweight, maybe light dumbbells)."} For each, give a realistic sets/reps range of similar difficulty to the original. Prefer common, well-known exercise names.

Respond with ONLY compact raw JSON, no markdown, no explanation, in this exact shape:
{"alternatives":[{"name":"exercise name","sets":3,"reps":"8-12"}]}`;
  return callClaude(prompt, 700);
}

async function generateMealAlternatives({ mealIdea, mealType, calories, proteinG, goal }) {
  const prompt = `Suggest 4 alternative ${mealType} ideas for someone whose goal is to ${GOAL_DESC_EN[goal] || goal}. Each alternative should be meaningfully different in style/ingredients from "${mealIdea}" — not a minor tweak — but should land close to the same nutrition: about ${calories} kcal and ${proteinG}g protein. Keep them realistic, simple meal ideas (not recipes).

Respond with ONLY compact raw JSON, no markdown, no explanation, in this exact shape:
{"alternatives":[{"idea":"short meal idea","calories":0,"protein_g":0}]}`;
  return callClaude(prompt, 700);
}

function buildTrainerContext(profile, plan) {
  const lines = [];
  lines.push(`Goal: ${GOAL_DESC_EN[plan.goal] || plan.goal}`);
  if (plan.experience) lines.push(`Experience level: ${plan.experience}`);
  if (plan.equipment) lines.push(`Trains at: ${plan.equipment === "gym" ? "a gym" : "home"}`);
  if (plan.weekdays && plan.weekdays.length) lines.push(`Training days: ${plan.weekdays.join(", ")}`);
  if (plan.focusAreas && plan.focusAreas.length) lines.push(`Extra focus areas this cycle: ${plan.focusAreas.join(", ")}`);
  const cal = plan.dailyCalorieTarget || plan.mealCalorieTarget;
  const prot = plan.dailyProteinTarget || plan.mealProteinTarget;
  if (cal) lines.push(`Daily calorie target: ~${cal} kcal${prot ? `, protein target: ~${prot}g` : ""}`);
  if (plan.supplement && plan.supplement !== "none") {
    lines.push(`Takes ${plan.supplementServings || 1} serving(s)/day of ${plan.supplement === "whey" ? "whey protein" : "a mass gainer"} (~${plan.supplementProtein || 0}g protein, ~${plan.supplementCalories || 0} kcal)`);
  }
  if (plan.days && plan.days.length) {
    const splitText = plan.days.map((d) => `${d.weekday}: ${d.title} — ${(d.exercises || []).map((e) => `${e.name} (${e.sets}x${e.reps})`).join(", ")}`).join("; ");
    lines.push(`Current weekly split: ${splitText}`);
  }
  if (profile && profile.weight && profile.height && profile.age) {
    lines.push(`Body stats: ${profile.age}yo, ${profile.weight}kg, ${profile.height}cm`);
  }
  return lines.join("\n");
}

const CHAT_LANG_NAMES = {
  en: "English",
  ar: "Arabic",
  ckb: "Kurdish Sorani — write natively in the Sorani script the way a native Kurdish speaker from the Kurdistan Region of Iraq would, not a literal translation from English or Arabic phrasing",
};

async function askTrainer(history, contextText, lang) {
  const langName = CHAT_LANG_NAMES[lang] || "English";
  const systemPrompt = `You are a friendly, knowledgeable personal trainer and nutrition coach inside a fitness app, chatting with your client about their own plan. Here is their current situation:
${contextText}

Respond in ${langName} by default, since that's the language this person has the app set to — unless they write to you in a different language, in which case switch to replying in that language instead. When writing in Kurdish Sorani or Arabic, spell out units as full words in that script (e.g. Kurdish "191 گرام" for grams, not "191g"; Arabic "191 غرام", not "191g") — mixing a Latin abbreviation into the middle of a right-to-left sentence renders as visually broken/reordered text, so always use the native word for the unit instead. Double-check that Kurdish Sorani grammar, word order, and izafe constructions are correct and natural, not a literal word-for-word rendering from English. When writing Kurdish Sorani, use the correct Central Kurdish Unicode letters, not their similar-looking Arabic counterparts: ک (Kurdish keheh) not ك (Arabic kaf), ی (Kurdish/Farsi yeh) not ي (Arabic yeh), ە for a word-final short e (not bare ه), and use the Kurdish-specific letters گ, ڕ, ڵ, ۆ, ڤ, چ, ژ, پ where the word calls for them rather than substituting the nearest Arabic letter.

Answer conversationally and helpfully — about their training plan, specific exercises, form cues, nutrition, motivation, or general fitness questions. Reference their actual plan/numbers above when relevant instead of speaking generically. Keep answers concise — a few sentences to a short paragraph — unless they ask for more detail. When it helps organize a longer answer (like listing a few meal or exercise options), you can use **bold** for key terms/numbers and "- " bullet lines — the app renders these properly, so use them when they genuinely aid clarity, but don't over-format a short conversational reply. If a question needs a real medical diagnosis, injury assessment, or is outside general fitness coaching, say so plainly and suggest seeing a doctor or physiotherapist instead of guessing.`;
  const isOpus = lang === "ckb";
  let response;
  try {
    response = await callAiProxy({
      model: isOpus ? "claude-opus-5" : "claude-haiku-4-5-20251001",
      max_tokens: isOpus ? 1400 : 600,
      ...(isOpus ? { output_config: { effort: "low" } } : {}),
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (e) {
    throw new Error(`network: ${e.message || e}`);
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`bad response (HTTP ${response.status})`);
  }
  if (!response.ok) {
    const apiMsg = (data && data.error && data.error.message) || JSON.stringify(data).slice(0, 200);
    throw new Error(`API error (HTTP ${response.status}): ${apiMsg}`);
  }
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!text) throw new Error(`empty response (stop_reason: ${data.stop_reason || "unknown"})`);
  return text.trim();
}

/* ============================== SMALL UI PRIMITIVES ============================== */
function Screen({ children }) {
  return <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 100px" }}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", disabled, full, style, type = "button" }) {
  const base = {
    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, borderRadius: 12,
    padding: "13px 20px", border: "none", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: full ? "100%" : undefined, opacity: disabled ? 0.55 : 1, transition: "transform .12s ease, background .15s ease",
  };
  const variants = {
    primary: { background: TOKENS.herb, color: TOKENS.cream },
    saffron: { background: TOKENS.saffron, color: TOKENS.herbDeep },
    ghost: { background: "transparent", color: TOKENS.herbDeep, border: `1.5px solid ${TOKENS.line}` },
    subtle: { background: TOKENS.paperRaised, color: TOKENS.ink, border: `1px solid ${TOKENS.line}` },
    danger: { background: "transparent", color: TOKENS.clay, border: `1.5px solid ${TOKENS.clay}55` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.inkSoft, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)", fontSize: 16,
  padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${TOKENS.line}`,
  background: TOKENS.paperRaised, color: TOKENS.ink, outline: "none",
};

function SegmentGroup({ options, value, onChange, columns = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              textAlign: "start", padding: "12px 13px", borderRadius: 11, cursor: "pointer",
              border: `1.5px solid ${active ? TOKENS.herb : TOKENS.line}`,
              background: active ? TOKENS.herb : TOKENS.paperRaised,
              color: active ? TOKENS.cream : TOKENS.ink,
              fontFamily: "var(--font-body)", transition: "all .15s ease",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{opt.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  const t = useT();
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#1B2318cc", zIndex: 50,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: TOKENS.paper, width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
          borderRadius: "20px 20px 0 0", padding: "20px 18px 28px", boxShadow: "0 -10px 40px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: TOKENS.herbDeep, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 999, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={TOKENS.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================== ONBOARDING ============================== */
function Onboarding({ existing, onSaved, onCancel }) {
  const t = useT();
  const [form, setForm] = useState(existing || {
    gender: "male", age: "", weight: "", height: "", activity: "moderate", goal: "maintain",
  });
  const [err, setErr] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit() {
    const age = Number(form.age), weight = Number(form.weight), height = Number(form.height);
    if (!age || !weight || !height || age < 10 || age > 100 || weight < 25 || weight > 300 || height < 100 || height > 250) {
      setErr(true);
      return;
    }
    setErr(false);
    const profile = { gender: form.gender, age, weight, height, activity: form.activity, goal: form.goal };
    const targets = computeTargets(profile);
    onSaved({ ...profile, ...targets });
  }

  return (
    <Screen>
      <div style={{ textAlign: "start", marginBottom: 22, marginTop: 8 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, color: TOKENS.herbDeep, margin: "0 0 8px" }}>{t.onb_title}</h1>
        <p style={{ color: TOKENS.inkSoft, fontSize: 15, margin: 0, lineHeight: 1.5 }}>{t.onb_sub}</p>
      </div>

      <Field label={t.onb_gender}>
        <SegmentGroup
          value={form.gender} onChange={(v) => set("gender", v)}
          options={[{ value: "male", label: t.onb_male }, { value: "female", label: t.onb_female }]}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Field label={`${t.onb_age}`}>
          <input style={inputStyle} type="number" inputMode="numeric" placeholder={t.onb_age_unit} value={form.age} onChange={(e) => set("age", e.target.value)} />
        </Field>
        <Field label={`${t.onb_weight}`}>
          <input style={inputStyle} type="number" inputMode="numeric" placeholder={t.onb_weight_unit} value={form.weight} onChange={(e) => set("weight", e.target.value)} />
        </Field>
        <Field label={`${t.onb_height}`}>
          <input style={inputStyle} type="number" inputMode="numeric" placeholder={t.onb_height_unit} value={form.height} onChange={(e) => set("height", e.target.value)} />
        </Field>
      </div>

      <Field label={t.onb_activity}>
        <SegmentGroup
          columns={1}
          value={form.activity} onChange={(v) => set("activity", v)}
          options={[
            { value: "sedentary", label: t.act_sedentary, sub: t.act_sedentary_d },
            { value: "light", label: t.act_light, sub: t.act_light_d },
            { value: "moderate", label: t.act_moderate, sub: t.act_moderate_d },
            { value: "active", label: t.act_active, sub: t.act_active_d },
            { value: "very", label: t.act_very, sub: t.act_very_d },
          ]}
        />
      </Field>

      <Field label={t.onb_goal}>
        <SegmentGroup
          columns={1}
          value={form.goal} onChange={(v) => set("goal", v)}
          options={[
            { value: "lose", label: t.goal_lose },
            { value: "maintain", label: t.goal_maintain },
            { value: "gain", label: t.goal_gain },
            { value: "leanGain", label: t.goal_lean_gain, sub: t.goal_lean_gain_sub },
            { value: "recomp", label: t.goal_recomp, sub: t.goal_recomp_sub },
          ]}
        />
      </Field>

      {err && <div style={{ color: TOKENS.clay, fontSize: 13.5, marginBottom: 14 }}>{t.onb_err}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        {onCancel && <Button variant="ghost" onClick={onCancel} full>{t.cancel}</Button>}
        <Button variant="saffron" onClick={submit} full>
          {existing ? t.onb_edit_submit : t.onb_submit}
        </Button>
      </div>
    </Screen>
  );
}

/* ============================== TODAY VIEW PIECES ============================== */
function StatChip({ icon, label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>{icon}<span style={{ fontWeight: 700, fontSize: 15, color: TOKENS.ink }}>{value}</span></div>
      <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>{label}</div>
    </div>
  );
}

function CalorieRingCard({ target, consumed, burned }) {
  const t = useT();
  const net = consumed - burned;
  const remaining = target - net;
  const pct = clamp(net / target, 0, 1);
  const size = 148, stroke = 13, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const over = net > target;
  const dash = c * clamp(pct, 0, 1);
  return (
    <div style={{
      background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 16,
      padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", flex: 1,
    }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={TOKENS.line} strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={over ? TOKENS.clay : TOKENS.saffron}
            strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: "stroke-dasharray .5s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, color: over ? TOKENS.clay : TOKENS.herbDeep, lineHeight: 1 }}>
            {Math.abs(remaining)}
          </div>
          <div style={{ fontSize: 10.5, color: TOKENS.inkSoft, marginTop: 5, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
            {t.unit_kcal}<br />{t.today_remaining}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: TOKENS.inkSoft }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: TOKENS.saffron, display: "inline-block" }} />{t.today_consumed}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: TOKENS.inkSoft }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: TOKENS.clay, display: "inline-block" }} />{t.today_burned}
        </div>
      </div>
    </div>
  );
}

const MACRO_ICONS = { protein: PersonStanding, carbs: Cookie, fat: Waves };
function MacroMiniCard({ icon: Icon, label, consumed, target, color }) {
  const over = target > 0 && consumed > target;
  const pct = target > 0 ? clamp((consumed / target) * 100, 0, 100) : 0;
  const barColor = over ? TOKENS.clay : color;
  return (
    <div style={{
      background: TOKENS.paperRaised, border: `1px solid ${over ? `${TOKENS.clay}55` : TOKENS.line}`, borderRadius: 14,
      padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 999, background: `${barColor}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color={barColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: over ? TOKENS.clay : TOKENS.ink }}>
          {consumed}<span style={{ fontWeight: 500, color: TOKENS.inkSoft }}>g/{target}g</span> <span style={{ fontWeight: 500, color: TOKENS.inkSoft }}>{label}</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: TOKENS.line, overflow: "hidden", marginTop: 5 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width .4s ease" }} />
        </div>
      </div>
    </div>
  );
}

/* ---- Week strip ---- */
function WeekStrip({ viewedISO, weekOffset, onWeekOffset, onPick, logs, target }) {
  const t = useT();
  const days = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const monthLabel = `${t.months[days[3].getMonth()]} ${days[3].getFullYear()}`;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => onWeekOffset(weekOffset - 1)} style={navArrowStyle}><ChevronLeft size={16} color={TOKENS.inkSoft} /></button>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink }}>{monthLabel}</div>
        <button onClick={() => weekOffset < 0 && onWeekOffset(weekOffset + 1)} style={{ ...navArrowStyle, opacity: weekOffset >= 0 ? 0.3 : 1, cursor: weekOffset >= 0 ? "default" : "pointer" }} disabled={weekOffset >= 0}>
          <ChevronRight size={16} color={TOKENS.inkSoft} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {days.map((d, i) => {
          const iso = todayISO(d);
          const isSelected = iso === viewedISO;
          const isToday = iso === todayISO();
          const future = isFutureISO(iso);
          const dayLog = logs[iso];
          const net = dayLog ? (dayLog.meals || []).reduce((s, m) => s + m.calories, 0) - (dayLog.exercises || []).reduce((s, e) => s + e.caloriesBurned, 0) : 0;
          const pct = dayLog && target ? clamp(net / target, 0, 1) : 0;
          const dot = 30, strokeW = 2.5, rr = (dot - strokeW) / 2, cc = 2 * Math.PI * rr;
          return (
            <button
              key={iso} disabled={future} onClick={() => onPick(iso)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "4px 0",
                background: "none", border: "none", cursor: future ? "default" : "pointer", opacity: future ? 0.35 : 1,
              }}
            >
              <span style={{ fontSize: 10, color: TOKENS.inkSoft, fontWeight: 600 }}>{t.weekdaysShort[i]}</span>
              <div style={{ position: "relative", width: dot, height: dot }}>
                {isSelected ? (
                  <div style={{ width: dot, height: dot, borderRadius: 999, background: TOKENS.herb, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.cream }}>{d.getDate()}</span>
                  </div>
                ) : (
                  <>
                    {dayLog && (
                      <svg width={dot} height={dot} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                        <circle cx={dot / 2} cy={dot / 2} r={rr} stroke={TOKENS.line} strokeWidth={strokeW} fill="none" />
                        <circle cx={dot / 2} cy={dot / 2} r={rr} stroke={net > target ? TOKENS.clay : TOKENS.saffron} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeDasharray={`${cc * pct} ${cc}`} />
                      </svg>
                    )}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? TOKENS.herbDeep : TOKENS.ink }}>{d.getDate()}</span>
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const navArrowStyle = {
  background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 999,
  width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
};

/* ---- Unified log list ---- */
const MEAL_ICONS = { breakfast: Sunrise, lunch: Sun, dinner: Moon, snack: Cookie };
function LogList({ meals, exercises, locked, onDeleteMeal, onDeleteExercise }) {
  const t = useT();
  const [filter, setFilter] = useState("all");
  const mealLabel = { breakfast: t.meal_breakfast, lunch: t.meal_lunch, dinner: t.meal_dinner, snack: t.meal_snack };
  const exLabel = {
    walking: t.ex_walking, running: t.ex_running, cycling: t.ex_cycling, swimming: t.ex_swimming,
    treadmill: t.ex_treadmill, stationaryBike: t.ex_stationaryBike, rowingMachine: t.ex_rowing,
    weightTraining: t.ex_weights, jumpRope: t.ex_jumpRope, hiit: t.ex_hiit, dancing: t.ex_dancing,
  };
  const rows = useMemo(() => {
    const m = meals.map((x) => ({ ...x, kind: "meal", at: x.at || 0 }));
    const e = exercises.map((x) => ({ ...x, kind: "exercise", at: x.at || 0 }));
    return [...m, ...e].sort((a, b) => b.at - a.at);
  }, [meals, exercises]);
  const filtered = rows.filter((r) => filter === "all" || (filter === "meals" && r.kind === "meal") || (filter === "exercise" && r.kind === "exercise"));

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: TOKENS.ink }}>{t.log_title}</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["all", t.log_all], ["meals", t.log_meals], ["exercise", t.log_exercise_tab]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "6px 13px", borderRadius: 999, border: `1.5px solid ${filter === k ? TOKENS.herb : TOKENS.line}`,
            background: filter === k ? TOKENS.herb : TOKENS.paperRaised, color: filter === k ? TOKENS.cream : TOKENS.inkSoft,
            fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
          }}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "26px 10px", color: TOKENS.inkSoft, fontSize: 13.5, background: TOKENS.paperRaised, border: `1px dashed ${TOKENS.line}`, borderRadius: 14 }}>
          {t.log_empty}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {filtered.map((r) => {
            const Icon = r.kind === "meal" ? (MEAL_ICONS[r.type] || UtensilsCrossed) : (EX_ICONS[r.type] || Dumbbell);
            const title = r.kind === "meal" ? r.name : (exLabel[r.type] || r.type);
            const subtitle = r.kind === "meal" ? mealLabel[r.type] : `${r.minutes} ${t.ex_minutes}`;
            const value = r.kind === "meal" ? r.calories : -r.caloriesBurned;
            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 11, background: TOKENS.paperRaised,
                border: `1px solid ${TOKENS.line}`, borderRadius: 13, padding: "10px 13px",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: r.kind === "meal" ? `${TOKENS.herb}1a` : `${TOKENS.clay}16`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={r.kind === "meal" ? TOKENS.herbDeep : TOKENS.clay} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{subtitle}</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: value < 0 ? TOKENS.clay : TOKENS.ink, flexShrink: 0 }}>
                  {value < 0 ? "" : "+"}{value} {t.unit_kcal}
                </div>
                {!locked && (
                  <button
                    onClick={() => (r.kind === "meal" ? onDeleteMeal(r.id) : onDeleteExercise(r.id))}
                    title={t.log_delete} aria-label={t.log_delete}
                    style={{
                      width: 26, height: 26, borderRadius: 999, background: "transparent", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} color={TOKENS.inkSoft} style={{ pointerEvents: "none" }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== ADD MEAL MODAL ============================== */
function AddMealModal({ mealType, cache, onClose, onSave }) {
  const t = useT();
  const [mode, setMode] = useState("text");
  const [type, setType] = useState(mealType);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState(null);
  const [portions, setPortions] = useState(null);
  const [matchedCache, setMatchedCache] = useState(false);
  const [matchedKurdish, setMatchedKurdish] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const fileRef = useRef(null);

  const cacheEntries = useMemo(() => Object.values(cache || {}).sort((a, b) => (b.count - a.count) || (b.lastAt - a.lastAt)), [cache]);
  // Only surface something as a "frequent meal" once it's actually been logged 3+ times.
  const frequentEntries = useMemo(() => cacheEntries.filter((e) => e.count >= 3).slice(0, 5), [cacheEntries]);
  const matchingEntries = useMemo(() => {
    if (foldForSearch(name).length < 2) return [];
    return cacheEntries.filter((e) => dishMatchesQuery(e.name, name)).slice(0, 5);
  }, [cacheEntries, name]);
  const kurdishMatches = useMemo(() => {
    if (foldForSearch(name).length < 2) return [];
    return ALL_LOG_DISHES.filter((d) => dishMatchesQuery(d.name, name)).slice(0, 6);
  }, [name]);

  function useCachedEntry(entry) {
    setName(entry.name);
    setPortions(null);
    setResult({ name: entry.name, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat });
    setMatchedCache(true);
    setMatchedKurdish(false);
    setErrMsg("");
  }

  function useKurdishDish(entry) {
    setName(entry.name);
    setPortions(null);
    setResult({ name: entry.name, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat });
    setMatchedKurdish(true);
    setMatchedCache(false);
    setErrMsg("");
  }

  const mealTypeOptions = [
    { value: "breakfast", label: t.meal_breakfast },
    { value: "lunch", label: t.meal_lunch },
    { value: "dinner", label: t.meal_dinner },
    { value: "snack", label: t.meal_snack },
  ];

  async function handleParsePortions() {
    if (!name.trim()) return;
    setLoading(true); setErrMsg(""); setResult(null); setPortions(null); setMatchedCache(false); setMatchedKurdish(false);
    try {
      const r = await parseMealPortions(name.trim(), type);
      const items = (r.items || []).map((it) => ({ name: it.name || "", unit: it.unit || "g", amount: Number(it.amount) || 0 }));
      if (!items.length) throw new Error("no items parsed");
      setPortions(items);
    } catch (e) {
      setErrMsg(t.meal_ai_fail);
    } finally { setLoading(false); }
  }

  function updatePortionAmount(index, amount) {
    setPortions((prev) => prev.map((p, i) => (i === index ? { ...p, amount } : p)));
  }

  async function handleEstimateFromPortions() {
    setLoading(true); setErrMsg("");
    try {
      const r = await estimateFromPortions(portions, type);
      setResult({ name: r.name || name, calories: Math.round(r.calories) || 0, protein: Math.round(r.protein_g) || 0, carbs: Math.round(r.carbs_g) || 0, fat: Math.round(r.fat_g) || 0 });
    } catch (e) {
      setErrMsg(t.meal_ai_fail);
      setResult({ name: name, calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally { setLoading(false); }
  }

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";
      setPhotoData(dataUrl);
      setLoading(true); setErrMsg(""); setResult(null); setMatchedCache(false); setMatchedKurdish(false);
      try {
        const r = await estimateCaloriesFromImage(base64, mimeType, type);
        const guessedName = r.name || "Meal";
        const cached = (cache || {})[normalizeFoodName(guessedName)];
        if (cached) {
          setResult({ name: cached.name, calories: cached.calories, protein: cached.protein, carbs: cached.carbs, fat: cached.fat });
          setMatchedCache(true);
        } else {
          setResult({ name: guessedName, calories: Math.round(r.calories) || 0, protein: Math.round(r.protein_g) || 0, carbs: Math.round(r.carbs_g) || 0, fat: Math.round(r.fat_g) || 0 });
        }
      } catch (err) {
        setErrMsg(t.meal_ai_fail);
        setResult({ name: "Meal", calories: 0, protein: 0, carbs: 0, fat: 0 });
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }

  function updateResult(k, v) { setResult((r) => ({ ...r, [k]: v })); setMatchedCache(false); setMatchedKurdish(false); }

  function save() {
    if (!result || !result.name) return;
    onSave({ id: uid(), type, name: result.name, calories: Number(result.calories) || 0, protein: Number(result.protein) || 0, carbs: Number(result.carbs) || 0, fat: Number(result.fat) || 0, at: Date.now() });
  }

  return (
    <Modal title={t.modal_addMeal} onClose={onClose}>
      <Field label={t.meal_type_label}>
        <SegmentGroup value={type} onChange={setType} options={mealTypeOptions} columns={4} />
      </Field>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode("text")} style={tabBtnStyle(mode === "text")}>
          <TypeIcon size={15} /> {t.tab_text}
        </button>
        <button onClick={() => setMode("photo")} style={tabBtnStyle(mode === "photo")}>
          <Camera size={15} /> {t.tab_photo}
        </button>
      </div>

      {mode === "text" && (
        <>
          <Field label=" ">
            <input
              style={inputStyle} placeholder={t.meal_name_ph} value={name}
              onChange={(e) => { setName(e.target.value); setPortions(null); setMatchedCache(false); setMatchedKurdish(false); }}
            />
          </Field>

          {!result && !portions && matchingEntries.length > 0 && (
            <CacheChipList label={t.cache_suggestions} entries={matchingEntries} onPick={useCachedEntry} />
          )}
          {!result && !portions && kurdishMatches.length > 0 && (
            <CacheChipList label={t.cache_library} entries={kurdishMatches} onPick={useKurdishDish} />
          )}
          {!result && !portions && name.trim().length < 2 && frequentEntries.length > 0 && (
            <CacheChipList label={t.cache_frequent} entries={frequentEntries} onPick={useCachedEntry} />
          )}

          {!result && !portions && (
            <Button variant="saffron" full onClick={handleParsePortions} disabled={!name.trim() || loading}>
              {loading ? <><Loader2 size={16} className="spin" /> {t.meal_estimating}</> : t.meal_continue}
            </Button>
          )}

          {!result && portions && (
            <div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 10 }}>{t.meal_adjust_portions}</div>
              {portions.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, fontSize: 13.5, color: TOKENS.ink }}>{p.name}</div>
                  <input
                    type="number" inputMode="decimal" value={p.amount}
                    onChange={(e) => updatePortionAmount(i, e.target.value)}
                    style={{ ...inputStyle, width: 66, padding: "8px 10px", fontSize: 13.5, marginBottom: 0, textAlign: "center" }}
                  />
                  <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, width: 42, flexShrink: 0 }}>{p.unit}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Button variant="ghost" style={{ padding: "10px 16px" }} onClick={() => setPortions(null)} disabled={loading}>
                  {t.cancel}
                </Button>
                <Button variant="saffron" full onClick={handleEstimateFromPortions} disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spin" /> {t.meal_estimating}</> : t.meal_estimate}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "photo" && (
        <>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
          {!photoData ? (
            <Button variant="saffron" full onClick={() => fileRef.current.click()}>
              <Camera size={16} /> {t.meal_photo_take}
            </Button>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <img src={photoData} alt="" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: TOKENS.inkSoft, fontSize: 13.5 }}>
                  <Loader2 size={15} className="spin" /> {t.meal_photo_analyzing}
                </div>
              )}
              {!loading && (
                <Button variant="ghost" full style={{ marginTop: 10 }} onClick={() => { setPhotoData(null); setResult(null); }}>
                  {t.meal_photo_retake}
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {errMsg && <div style={{ color: TOKENS.clay, fontSize: 13, margin: "10px 0" }}>{errMsg}</div>}

      {result && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${TOKENS.line}`, paddingTop: 14 }}>
          {matchedCache && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: TOKENS.herbDeep, background: `${TOKENS.herb}1a`, padding: "5px 10px", borderRadius: 999, marginBottom: 10 }}>
              <Check size={13} /> {t.cache_matched}
            </div>
          )}
          {matchedKurdish && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: TOKENS.herbDeep, background: `${TOKENS.herb}1a`, padding: "5px 10px", borderRadius: 999, marginBottom: 10 }}>
              <Check size={13} /> {t.cache_library_matched}
            </div>
          )}
          <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 10 }}>{t.meal_result_edit}</div>
          <Field label="">
            <input style={inputStyle} value={result.name} onChange={(e) => updateResult("name", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            <NumField label={t.unit_kcal} value={result.calories} onChange={(v) => updateResult("calories", v)} />
            <NumField label={`${t.macro_protein[0]} g`} value={result.protein} onChange={(v) => updateResult("protein", v)} />
            <NumField label={`${t.macro_carbs[0]} g`} value={result.carbs} onChange={(v) => updateResult("carbs", v)} />
            <NumField label={`${t.macro_fat[0]} g`} value={result.fat} onChange={(v) => updateResult("fat", v)} />
          </div>
          <Button variant="primary" full style={{ marginTop: 16 }} onClick={save}>
            <Check size={16} /> {t.meal_save}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function NumField({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: TOKENS.inkSoft, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <input type="number" style={{ ...inputStyle, padding: "9px 8px", fontSize: 14, textAlign: "center" }} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function CacheChipList({ label, entries, onPick }) {
  const t = useT();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.inkSoft, marginBottom: 7 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {entries.map((e) => (
          <button
            key={e.name}
            type="button"
            onClick={() => onPick(e)}
            title={t.cache_tap}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1,
              padding: "8px 12px", borderRadius: 11, border: `1.5px solid ${TOKENS.line}`,
              background: TOKENS.paperRaised, cursor: "pointer", fontFamily: "var(--font-body)", textAlign: "start",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>{e.name}</span>
            <span style={{ fontSize: 11, color: TOKENS.inkSoft }}>{e.calories} {t.unit_kcal}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "10px 0", borderRadius: 10, border: `1.5px solid ${active ? TOKENS.herb : TOKENS.line}`,
    background: active ? TOKENS.herb : TOKENS.paperRaised, color: active ? TOKENS.cream : TOKENS.ink,
    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
  };
}

/* ============================== EXERCISE MODAL ============================== */
const EX_ICONS = {
  walking: Footprints, running: PersonStanding, cycling: Bike, swimming: Waves,
  treadmill: Footprints, stationaryBike: Bike, rowingMachine: Anchor, weightTraining: Dumbbell,
  jumpRope: Zap, hiit: Flame, dancing: Music2,
};
function ExerciseModal({ onClose, onSave, excess, weight }) {
  const t = useT();
  const [context, setContext] = useState("home");
  const [manualType, setManualType] = useState("walking");
  const [manualMin, setManualMin] = useState(20);
  const [entryMode, setEntryMode] = useState("duration");
  const [stepCount, setStepCount] = useState(3000);
  const STEPS_PER_MIN = 100;

  const labelFor = {
    walking: t.ex_walking, running: t.ex_running, cycling: t.ex_cycling, swimming: t.ex_swimming,
    treadmill: t.ex_treadmill, stationaryBike: t.ex_stationaryBike, rowingMachine: t.ex_rowing,
    weightTraining: t.ex_weights, jumpRope: t.ex_jumpRope, hiit: t.ex_hiit, dancing: t.ex_dancing,
  };
  const types = context === "gym" ? GYM_TYPES : HOME_TYPES;

  function pickContext(next) {
    setContext(next);
    const nextTypes = next === "gym" ? GYM_TYPES : HOME_TYPES;
    if (!nextTypes.includes(manualType)) setManualType(nextTypes[0]);
    if (nextTypes[0] !== "walking" && !nextTypes.includes("walking")) setEntryMode("duration");
  }
  function pickManualType(v) {
    setManualType(v);
    if (v !== "walking") setEntryMode("duration");
  }

  function logExercise(type, minutes) {
    const rate = burnRatePerMin(type, weight);
    const burned = Math.round(rate * minutes);
    onSave({ id: uid(), type, minutes: Math.round(minutes), caloriesBurned: burned, at: Date.now() });
  }
  function logManual() {
    if (manualType === "walking" && entryMode === "steps") {
      logExercise("walking", (Number(stepCount) || 0) / STEPS_PER_MIN);
    } else {
      logExercise(manualType, Number(manualMin) || 0);
    }
  }

  return (
    <Modal title={t.ex_title} onClose={onClose}>
      <Field label={t.ex_where}>
        <SegmentGroup
          columns={2} value={context} onChange={pickContext}
          options={[{ value: "home", label: t.ex_tab_home }, { value: "gym", label: t.ex_tab_gym }]}
        />
      </Field>

      {excess > 0 && (
        <>
          <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 12 }}>{t.ex_suggested}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {types.map((type) => {
              const rate = burnRatePerMin(type, weight);
              const minutes = Math.max(5, Math.round(excess / rate));
              const Icon = EX_ICONS[type] || Dumbbell;
              return (
                <div key={type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: "11px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 999, background: `${TOKENS.herb}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={17} color={TOKENS.herbDeep} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: TOKENS.ink }}>{labelFor[type]}</div>
                      <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>{minutes} {t.ex_minutes} · {t.ex_burns} {Math.round(rate * minutes)} {t.unit_kcal}</div>
                    </div>
                  </div>
                  <Button variant="saffron" onClick={() => logExercise(type, minutes)} style={{ padding: "8px 14px", fontSize: 13 }}>{t.ex_logOneClick}</Button>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 10, borderTop: excess > 0 ? `1px solid ${TOKENS.line}` : "none", paddingTop: excess > 0 ? 16 : 0 }}>{t.ex_manual}</div>
      <Field label={t.ex_type}>
        <SegmentGroup columns={2} value={manualType} onChange={pickManualType} options={types.map((v) => ({ value: v, label: labelFor[v] }))} />
      </Field>
      {manualType === "walking" && (
        <Field label=" ">
          <SegmentGroup
            columns={2} value={entryMode} onChange={setEntryMode}
            options={[{ value: "duration", label: t.ex_by_duration }, { value: "steps", label: t.ex_by_steps }]}
          />
        </Field>
      )}
      {manualType === "walking" && entryMode === "steps" ? (
        <Field label={t.ex_steps_label}>
          <input type="number" inputMode="numeric" style={inputStyle} value={stepCount} onChange={(e) => setStepCount(e.target.value)} />
          <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 6 }}>
            {t.ex_steps_est.replace("{minutes}", Math.round((Number(stepCount) || 0) / STEPS_PER_MIN)).replace("{kcal}", Math.round(burnRatePerMin("walking", weight) * ((Number(stepCount) || 0) / STEPS_PER_MIN)))}
          </div>
        </Field>
      ) : (
        <Field label={t.ex_duration}>
          <input type="number" style={inputStyle} value={manualMin} onChange={(e) => setManualMin(e.target.value)} />
        </Field>
      )}
      <Button variant="primary" full onClick={logManual}>
        <Plus size={16} /> {t.ex_add}
      </Button>
    </Modal>
  );
}

/* ============================== DAY SUMMARY MODAL ============================== */
function DaySummaryModal({ onClose, onReopen, target, consumed, burned, mealsCount, exCount }) {
  const t = useT();
  const net = consumed - burned;
  const diff = net - target;
  let msg = t.summary_under;
  if (diff > target * 0.1) msg = t.summary_over;
  else if (Math.abs(diff) > target * 0.03) msg = t.summary_close_call;
  return (
    <Modal title={t.summary_title} onClose={onClose}>
      <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: diff > 0 ? TOKENS.clay : TOKENS.herbDeep }}>{net}</div>
        <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, fontWeight: 600, marginBottom: 10 }}>{t.summary_net} · {t.unit_kcal}</div>
        <div style={{ fontSize: 14.5, color: TOKENS.ink }}>{msg}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 0", borderTop: `1px solid ${TOKENS.line}`, borderBottom: `1px solid ${TOKENS.line}` }}>
        <StatChip icon={<UtensilsCrossed size={15} color={TOKENS.herbDeep} />} label={t.summary_meals} value={mealsCount} />
        <StatChip icon={<Activity size={15} color={TOKENS.clay} />} label={t.summary_exercise} value={exCount} />
        <StatChip icon={<Flame size={15} color={TOKENS.saffronDeep} />} label={t.today_target} value={target} />
      </div>
      <Button variant="primary" full style={{ marginTop: 20 }} onClick={onClose}>{t.summary_done}</Button>
      {onReopen && (
        <Button variant="ghost" full style={{ marginTop: 10 }} onClick={onReopen}>
          <Lock size={15} /> {t.summary_reopen}
        </Button>
      )}
    </Modal>
  );
}

/* ============================== LIVE SCAN MODAL ============================== */
const MARKER_COLORS = [TOKENS.saffron, TOKENS.herb, TOKENS.clay, TOKENS.fig, TOKENS.saffronDeep, TOKENS.herbDeep];
function ScanFrameOverlay() {
  const c = "rgba(255,255,255,.85)";
  const corner = { position: "absolute", width: 26, height: 26, border: `2.5px solid ${c}` };
  return (
    <>
      <div style={{ ...corner, top: 14, left: 14, borderRight: "none", borderBottom: "none", borderRadius: "8px 0 0 0" }} />
      <div style={{ ...corner, top: 14, right: 14, borderLeft: "none", borderBottom: "none", borderRadius: "0 8px 0 0" }} />
      <div style={{ ...corner, bottom: 14, left: 14, borderRight: "none", borderTop: "none", borderRadius: "0 0 0 8px" }} />
      <div style={{ ...corner, bottom: 14, right: 14, borderLeft: "none", borderTop: "none", borderRadius: "0 0 8px 0" }} />
    </>
  );
}

function LiveScanModal({ mealType, cache, onClose, onSaveItems }) {
  const t = useT();
  const [phase, setPhase] = useState("camera");
  const [hasLiveCamera, setHasLiveCamera] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [items, setItems] = useState([]);
  const [mealTypeSel, setMealTypeSel] = useState(mealType || "lunch");
  const [errMsg, setErrMsg] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const mealTypeOptions = [
    { value: "breakfast", label: t.meal_breakfast },
    { value: "lunch", label: t.meal_lunch },
    { value: "dinner", label: t.meal_dinner },
    { value: "snack", label: t.meal_snack },
  ];

  function startStream() {
    const supported = typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
    if (!supported) { setCameraFailed(true); return; }
    let settled = false;
    const timeout = setTimeout(() => { if (!settled) { settled = true; setCameraFailed(true); } }, 4000);
    try {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((stream) => {
        if (settled) { stream.getTracks().forEach((tr) => tr.stop()); return; }
        settled = true; clearTimeout(timeout);
        streamRef.current = stream;
        setHasLiveCamera(true);
        setCameraFailed(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }).catch(() => { if (!settled) { settled = true; clearTimeout(timeout); setCameraFailed(true); } });
    } catch (e) {
      settled = true; clearTimeout(timeout); setCameraFailed(true);
    }
  }

  useEffect(() => {
    startStream();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
  }

  async function analyze(dataUrl) {
    setPhotoData(dataUrl);
    setPhase("analyzing");
    setErrMsg("");
    try {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
      const mimeType = match ? match[1] : "image/jpeg";
      const base64 = match ? match[2] : dataUrl.split(",")[1];
      const r = await estimateItemsFromImage(base64, mimeType);
      const list = (r.items || []).map((it) => {
        const cached = (cache || {})[normalizeFoodName(it.name || "")];
        return {
          id: uid(),
          name: cached ? cached.name : (it.name || "Item"),
          calories: cached ? cached.calories : (Math.round(it.calories) || 0),
          protein: cached ? cached.protein : (Math.round(it.protein_g) || 0),
          carbs: cached ? cached.carbs : (Math.round(it.carbs_g) || 0),
          fat: cached ? cached.fat : (Math.round(it.fat_g) || 0),
          x: clamp(Number(it.x) || 50, 10, 90),
          y: clamp(Number(it.y) || 50, 10, 90),
          emoji: it.emoji || "🍽️",
          included: true,
          matched: !!cached,
        };
      });
      setItems(list);
      if (list.length) { setPhase("result"); } else { setErrMsg(t.scan_fail); setPhase("error"); }
    } catch (e) {
      setErrMsg(`${t.scan_fail} (${e.message || e})`);
      setPhase("error");
    }
  }

  function captureFromVideo() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    stopStream();
    analyze(canvas.toDataURL("image/jpeg", 0.85));
  }

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => analyze(reader.result);
    reader.readAsDataURL(file);
  }

  function retake() {
    setPhotoData(null); setItems([]); setErrMsg("");
    if (hasLiveCamera) { setPhase("camera"); startStream(); }
    else if (fileRef.current) { fileRef.current.click(); }
  }

  function toggleItem(id) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, included: !it.included } : it)));
  }

  const selected = items.filter((it) => it.included);
  const total = selected.reduce((s, it) => s + it.calories, 0);

  function confirm() {
    if (!selected.length) return;
    onSaveItems(selected.map((it) => ({
      id: uid(), type: mealTypeSel, name: it.name, calories: it.calories,
      protein: it.protein, carbs: it.carbs, fat: it.fat, at: Date.now(),
    })));
  }

  return (
    <Modal title={t.scan_title} onClose={() => { stopStream(); onClose(); }}>
      {phase === "camera" && (
        <div>
          {!cameraFailed ? (
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#111", aspectRatio: "3 / 4" }}>
              <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <ScanFrameOverlay />
            </div>
          ) : (
            <div style={{ padding: "34px 10px", textAlign: "center", color: TOKENS.inkSoft, fontSize: 13.5, background: TOKENS.paperRaised, borderRadius: 14, border: `1px dashed ${TOKENS.line}` }}>
              <Camera size={22} color={TOKENS.inkSoft} style={{ marginBottom: 8 }} />
              <div>{t.scan_choose}</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
          <div style={{ marginTop: 12, fontSize: 12.5, color: TOKENS.inkSoft, textAlign: "center" }}>{t.scan_point}</div>
          <Button variant="saffron" full style={{ marginTop: 12 }} onClick={() => (cameraFailed ? fileRef.current.click() : captureFromVideo())}>
            <ScanLine size={16} /> {cameraFailed ? t.scan_choose : t.scan_capture}
          </Button>
          {!cameraFailed && (
            <Button variant="ghost" full style={{ marginTop: 8 }} onClick={() => fileRef.current.click()}>
              {t.scan_choose}
            </Button>
          )}
        </div>
      )}

      {phase === "analyzing" && (
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden" }}>
            <img src={photoData} alt="" style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, color: TOKENS.inkSoft, fontSize: 13.5 }}>
            <Loader2 size={16} className="spin" /> {t.scan_analyzing}
          </div>
        </div>
      )}

      {phase === "result" && (
        <div>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
            <img src={photoData} alt="" style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "cover" }} />
            {items.map((it, i) => (
              <button key={it.id} onClick={() => toggleItem(it.id)} title={it.name} style={{
                position: "absolute", left: `${it.x}%`, top: `${it.y}%`, transform: "translate(-50%, -50%)",
                width: 26, height: 26, borderRadius: 999, border: "2px solid #fff", cursor: "pointer",
                background: it.included ? MARKER_COLORS[i % MARKER_COLORS.length] : "rgba(60,60,54,0.55)",
                color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,.35)", opacity: it.included ? 1 : 0.65, transition: "opacity .15s ease",
              }}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, textAlign: "center", margin: "8px 0 12px" }}>{t.scan_tapHint}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
            {items.map((it, i) => (
              <button key={it.id} onClick={() => toggleItem(it.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12,
                background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, cursor: "pointer", textAlign: "start",
                opacity: it.included ? 1 : 0.5, fontFamily: "var(--font-body)",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0, background: MARKER_COLORS[i % MARKER_COLORS.length],
                  color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</span>
                <span style={{ fontSize: 15 }}>{it.emoji}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: TOKENS.ink, textDecoration: it.included ? "none" : "line-through", display: "flex", alignItems: "center", gap: 5 }}>
                  {it.name}
                  {it.matched && <Check size={12} color={TOKENS.herbDeep} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.inkSoft, flexShrink: 0 }}>{it.calories} {t.unit_kcal}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Field label={t.scan_which_meal}>
              <SegmentGroup value={mealTypeSel} onChange={setMealTypeSel} options={mealTypeOptions} columns={4} />
            </Field>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderTop: `1px solid ${TOKENS.line}`, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: TOKENS.inkSoft, fontWeight: 600 }}>{t.scan_total}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: TOKENS.herbDeep }}>{total} {t.unit_kcal}</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={retake}><RotateCcw size={15} /> {t.scan_retake}</Button>
            <Button variant="primary" full onClick={confirm} disabled={!selected.length}>
              <Check size={16} /> {t.scan_add}
            </Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ color: TOKENS.clay, fontSize: 13.5, marginBottom: 14 }}>{errMsg}</div>
          <Button variant="ghost" full onClick={retake}><RotateCcw size={15} /> {t.scan_retake}</Button>
        </div>
      )}
    </Modal>
  );
}

/* ============================== TODAY VIEW ============================== */
function TodayView({ profile, log, foodCache, viewedISO, onChangeDate, logs, onAddMeal, onAddMeals, onAddExercise, onDeleteMeal, onDeleteExercise, onCloseDay, onOpenSummary }) {
  const t = useT();
  const [mealModal, setMealModal] = useState(null);
  const [exModal, setExModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const meals = log.meals || [];
  const exercises = log.exercises || [];
  const consumed = meals.reduce((s, m) => s + m.calories, 0);
  const burned = exercises.reduce((s, e) => s + e.caloriesBurned, 0);
  const net = consumed - burned;
  const excess = net - profile.calorieTarget;
  const protein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const carbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const fat = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const locked = !!log.closed || viewedISO < todayISO();
  const isToday = viewedISO === todayISO();
  const guessedMealType = (() => {
    const h = new Date().getHours();
    if (h < 11) return "breakfast";
    if (h < 16) return "lunch";
    if (h < 21) return "dinner";
    return "snack";
  })();

  return (
    <Screen>
      <WeekStrip
        viewedISO={viewedISO} weekOffset={weekOffset} onWeekOffset={setWeekOffset}
        onPick={onChangeDate} logs={logs} target={profile.calorieTarget}
      />

      {locked && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: TOKENS.herbDeep, fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>
          <Lock size={13} /> {t.today_closed}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginBottom: 16 }}>
        <CalorieRingCard target={profile.calorieTarget} consumed={consumed} burned={burned} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <MacroMiniCard icon={MACRO_ICONS.protein} label={t.macro_protein} consumed={protein} target={profile.proteinTarget} color={TOKENS.herb} />
          <MacroMiniCard icon={MACRO_ICONS.carbs} label={t.macro_carbs} consumed={carbs} target={profile.carbsTarget} color={TOKENS.saffron} />
          <MacroMiniCard icon={MACRO_ICONS.fat} label={t.macro_fat} consumed={fat} target={profile.fatTarget} color={TOKENS.fig} />
        </div>
      </div>

      {excess > 0 && !locked && (
        <div style={{ background: `${TOKENS.clay}14`, border: `1px solid ${TOKENS.clay}44`, borderRadius: 14, padding: "13px 15px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Flame size={16} color={TOKENS.clay} />
            <span style={{ fontWeight: 700, fontSize: 14, color: TOKENS.clay }}>{t.today_over}</span>
          </div>
          <div style={{ fontSize: 13, color: TOKENS.ink, marginBottom: 10, lineHeight: 1.5 }}>{t.today_overBody}</div>
          <Button variant="danger" onClick={() => setExModal(true)}>
            <Activity size={15} /> {t.today_addExercise}
          </Button>
        </div>
      )}

      {!locked && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { key: "scan", label: t.fab_scan, icon: ScanLine, onClick: () => setScanModal(true) },
            { key: "exercise", label: t.fab_exercise, icon: Activity, onClick: () => setExModal(true) },
            { key: "meal", label: t.fab_meal, icon: UtensilsCrossed, onClick: () => setMealModal(guessedMealType) },
          ].map((a) => (
            <button key={a.key} onClick={a.onClick} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14,
              padding: "12px 8px", cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              <span style={{ width: 34, height: 34, borderRadius: 999, background: TOKENS.herb, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.icon size={16} color={TOKENS.cream} style={{ pointerEvents: "none" }} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: TOKENS.ink, textAlign: "center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      )}

      <LogList meals={meals} exercises={exercises} locked={locked} onDeleteMeal={onDeleteMeal} onDeleteExercise={onDeleteExercise} />

      {!locked ? (
        <Button variant="primary" full style={{ marginTop: 4 }} onClick={onCloseDay} disabled={meals.length === 0 && exercises.length === 0}>
          <Lock size={15} /> {t.today_closeDay}
        </Button>
      ) : (
        <Button variant="subtle" full style={{ marginTop: 4 }} onClick={onOpenSummary}>
          {t.today_reopen}
        </Button>
      )}

      {mealModal && (
        <AddMealModal
          mealType={mealModal} cache={foodCache}
          onClose={() => setMealModal(null)}
          onSave={(m) => { onAddMeal(m); setMealModal(null); }}
        />
      )}
      {exModal && (
        <ExerciseModal
          excess={excess} weight={profile.weight}
          onClose={() => setExModal(false)}
          onSave={(e) => { onAddExercise(e); setExModal(false); }}
        />
      )}
      {scanModal && (
        <LiveScanModal
          mealType={guessedMealType} cache={foodCache}
          onClose={() => setScanModal(false)}
          onSaveItems={(items) => { onAddMeals(items); setScanModal(false); }}
        />
      )}
    </Screen>
  );
}

/* ============================== REPORTS VIEW ============================== */
function ReportsView({ logs, target }) {
  const t = useT();
  const days = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = todayISO(d);
      const log = logs[iso];
      const consumed = log ? (log.meals || []).reduce((s, m) => s + m.calories, 0) : null;
      const burned = log ? (log.exercises || []).reduce((s, e) => s + e.caloriesBurned, 0) : 0;
      const net = consumed === null ? null : consumed - burned;
      arr.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        net, target,
      });
    }
    return arr;
  }, [logs, target]);

  const closedDays = Object.values(logs).filter((l) => l.closed);
  const now = new Date();
  const monthDays = Object.entries(logs).filter(([iso, l]) => l.closed && iso.startsWith(todayISO(now).slice(0, 7)));
  const avgCalories = monthDays.length
    ? Math.round(monthDays.reduce((s, [, l]) => s + ((l.meals || []).reduce((a, m) => a + m.calories, 0) - (l.exercises || []).reduce((a, e) => a + e.caloriesBurned, 0)), 0) / monthDays.length)
    : 0;
  const avgAdherence = monthDays.length
    ? Math.round(monthDays.reduce((s, [, l]) => {
        const net = (l.meals || []).reduce((a, m) => a + m.calories, 0) - (l.exercises || []).reduce((a, e) => a + e.caloriesBurned, 0);
        return s + clamp(100 - (Math.abs(net - target) / target) * 100, 0, 100);
      }, 0) / monthDays.length)
    : 0;

  const hasData = closedDays.length > 0;

  return (
    <Screen>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: TOKENS.herbDeep, margin: "14px 0 18px" }}>{t.reports_title}</h1>

      {!hasData && (
        <div style={{ background: TOKENS.paperRaised, border: `1px dashed ${TOKENS.line}`, borderRadius: 14, padding: 22, textAlign: "center", color: TOKENS.inkSoft, fontSize: 14 }}>
          {t.reports_empty}
        </div>
      )}

      <div style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: "16px 12px 6px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, marginBottom: 10, paddingInlineStart: 4 }}>{t.reports_7d}</div>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={days} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={TOKENS.line} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: TOKENS.inkSoft }} axisLine={{ stroke: TOKENS.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${TOKENS.line}`, fontSize: 12 }} />
            <Bar dataKey="net" name={t.reports_net_bar} fill={TOKENS.saffron} radius={[6, 6, 0, 0]} maxBarSize={26} />
            <Line dataKey="target" name={t.reports_target_line} stroke={TOKENS.herb} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink, marginBottom: 10 }}>{t.reports_month}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard label={t.reports_avg} value={`${avgCalories}`} sub={t.unit_kcal} />
        <StatCard label={t.reports_adherence} value={`${avgAdherence}%`} />
        <StatCard label={t.reports_days} value={`${monthDays.length}`} />
      </div>
    </Screen>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: "13px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: TOKENS.herbDeep }}>{value}</div>
      <div style={{ fontSize: 10.5, color: TOKENS.inkSoft, marginTop: 3 }}>{label}{sub ? ` (${sub})` : ""}</div>
    </div>
  );
}

/* ============================== SETTINGS VIEW ============================== */
const LANGS = [{ code: "en", label: "English" }, { code: "ar", label: "العربية" }, { code: "ckb", label: "کوردیی ناوەندی" }];
function SettingsView({ lang, onLangChange, onEditProfile }) {
  const t = useT();
  return (
    <Screen>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: TOKENS.herbDeep, margin: "14px 0 18px" }}>{t.settings_title}</h1>

      <Field label={t.settings_language}>
        <SegmentGroup columns={1} value={lang} onChange={onLangChange} options={LANGS.map((l) => ({ value: l.code, label: l.label }))} />
      </Field>

      <div style={{ marginTop: 8 }}>
        <Button variant="subtle" full onClick={onEditProfile}>
          <Pencil size={15} /> {t.settings_editProfile}
        </Button>
      </div>

      <div style={{ marginTop: 24, padding: "14px 15px", background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.ink, marginBottom: 6 }}>{t.settings_about}</div>
        <div style={{ fontSize: 13, color: TOKENS.inkSoft, lineHeight: 1.6 }}>{t.settings_about_body}</div>
        <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TOKENS.line}` }}>{t.settings_credit}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Button variant="subtle" full onClick={() => supabase.auth.signOut()} style={{ color: TOKENS.clay }}>
          <LogOut size={15} /> {t.settings_logout}
        </Button>
      </div>
    </Screen>
  );
}

/* ============================== TRAINING ============================== */
function GoalAdvisory({ profile, goal, onSaveWaist }) {
  const t = useT();
  const [waistInput, setWaistInput] = useState("");
  if (goal !== "gain" && goal !== "leanGain") return null;
  const bmi = calcBMI(profile.weight, profile.height);
  if (!bmi || bmi < 25) return null;

  if (profile.waist) {
    const whtr = calcWHtR(profile.waist, profile.height);
    if (whtr < 0.5) {
      return (
        <div style={{ background: `${TOKENS.herb}14`, border: `1px solid ${TOKENS.herb}44`, borderRadius: 12, padding: "11px 13px", fontSize: 12.5, color: TOKENS.ink, lineHeight: 1.5, marginBottom: 16 }}>
          {t.train_whtr_ok}
        </div>
      );
    }
    return (
      <div style={{ background: `${TOKENS.saffron}1f`, border: `1px solid ${TOKENS.saffron}55`, borderRadius: 12, padding: "11px 13px", fontSize: 12.5, color: TOKENS.ink, lineHeight: 1.5, marginBottom: 16 }}>
        {t.train_whtr_note.replace("{ratio}", whtr.toFixed(2))}
      </div>
    );
  }

  return (
    <div style={{ background: `${TOKENS.saffron}1f`, border: `1px solid ${TOKENS.saffron}55`, borderRadius: 12, padding: "11px 13px", marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, color: TOKENS.ink, lineHeight: 1.5, marginBottom: 9 }}>{t.train_bmi_note.replace("{bmi}", bmi.toFixed(1))}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number" inputMode="numeric" value={waistInput} onChange={(e) => setWaistInput(e.target.value)}
          placeholder={t.train_waist_placeholder}
          style={{ ...inputStyle, padding: "8px 10px", fontSize: 13.5, flex: 1 }}
        />
        <Button
          variant="ghost" style={{ padding: "8px 16px", fontSize: 13 }}
          onClick={() => { const v = Number(waistInput); if (v > 30 && v < 220) onSaveWaist(v); }}
        >
          {t.train_waist_save}
        </Button>
      </div>
    </div>
  );
}

function WeekdayToggle({ value, onChange }) {
  const t = useT();
  function toggle(day) {
    if (value.includes(day)) onChange(value.filter((d) => d !== day));
    else onChange([...value, day]);
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
      {WEEKDAY_KEYS.map((day, i) => {
        const active = value.includes(day);
        return (
          <button key={day} type="button" onClick={() => toggle(day)} style={{
            padding: "10px 0", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-body)",
            border: `1.5px solid ${active ? TOKENS.herb : TOKENS.line}`,
            background: active ? TOKENS.herb : TOKENS.paperRaised,
            color: active ? TOKENS.cream : TOKENS.ink, fontSize: 11.5, fontWeight: 700,
          }}>
            {t.weekdaysShort[i]}
          </button>
        );
      })}
    </div>
  );
}

function TrainingSetup({ profile, onGenerate, onUpdateWaist, lang }) {
  const t = useT();
  const [experience, setExperience] = useState("beginner");
  const [equipment, setEquipment] = useState("home");
  const [weekdays, setWeekdays] = useState(["monday", "wednesday", "friday"]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [mealStyle, setMealStyle] = useState("mix");
  const [supplement, setSupplement] = useState("none");
  const [supplementServings, setSupplementServings] = useState(1);
  const [servingProtein, setServingProtein] = useState(SUPPLEMENT_PER_SERVING.whey.protein);
  const [servingCalories, setServingCalories] = useState(SUPPLEMENT_PER_SERVING.whey.calories);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  function pickSupplement(next) {
    setSupplement(next);
    if (next !== "none" && SUPPLEMENT_PER_SERVING[next]) {
      setServingProtein(SUPPLEMENT_PER_SERVING[next].protein);
      setServingCalories(SUPPLEMENT_PER_SERVING[next].calories);
    }
  }

  function toggleFocusArea(value) {
    if (value === "whole") { setFocusAreas([]); return; }
    setFocusAreas((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function submit() {
    if (!weekdays.length) { setError(t.train_err_days); return; }
    setError(""); setGenerating(true);
    try {
      const orderedDays = WEEKDAY_KEYS.filter((d) => weekdays.includes(d));
      const goalTargets = computeTargets(profile);
      const servings = supplement === "none" ? 0 : (Number(supplementServings) || 0);
      const supp = {
        protein: servings * (Number(servingProtein) || 0),
        calories: servings * (Number(servingCalories) || 0),
      };
      const foodCalorieTarget = Math.max(Math.round(goalTargets.calorieTarget - supp.calories), 800);
      const foodProteinTarget = Math.max(Math.round(goalTargets.proteinTarget - supp.protein), 20);
      const [program, meals] = await Promise.all([
        generateTrainingProgram({ goal: profile.goal, experience, equipment, weekdays: orderedDays, focusAreas, age: profile.age, lang }),
        generateMealIdeas({
          goal: profile.goal, calorieTarget: foodCalorieTarget, proteinTarget: foodProteinTarget,
          carbsTarget: goalTargets.carbsTarget, fatTarget: goalTargets.fatTarget, mealStyle, lang,
        }),
      ]);
      onGenerate({
        goal: profile.goal, experience, equipment, weekdays: orderedDays, focusAreas, mealStyle, contentLang: lang || "en",
        splitName: program.splitName || "",
        days: (program.days || []).map((d) => ({ ...d, weekday: (d.weekday || "").toLowerCase().trim() })),
        progression: (program.progression || []).map((p) => ({ ...p, week: Number(p.week) })), summary: program.summary || "",
        mealIdeas: (meals.days || []).map((d) => ({ style: d.style || "", meals: d.meals || [] })), startDate: todayISO(),
        mealCalorieTarget: foodCalorieTarget, mealProteinTarget: foodProteinTarget,
        dailyCalorieTarget: goalTargets.calorieTarget, dailyProteinTarget: goalTargets.proteinTarget,
        supplement, supplementServings: servings,
        supplementProteinPerServing: Number(servingProtein) || 0, supplementCaloriesPerServing: Number(servingCalories) || 0,
        supplementProtein: Math.round(supp.protein), supplementCalories: Math.round(supp.calories),
      });
    } catch (e) {
      setError(`${t.train_err_generic} (${e.message || e})`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div style={{ marginTop: 8, marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: TOKENS.herbDeep, margin: "0 0 8px" }}>{t.train_setup_title}</h1>
        <p style={{ color: TOKENS.inkSoft, fontSize: 14, margin: 0, lineHeight: 1.5 }}>{t.train_setup_sub}</p>
      </div>

      <GoalAdvisory profile={profile} goal={profile.goal} onSaveWaist={onUpdateWaist} />

      <Field label={t.train_experience}>
        <SegmentGroup columns={3} value={experience} onChange={setExperience} options={[
          { value: "beginner", label: t.train_exp_beginner },
          { value: "intermediate", label: t.train_exp_intermediate },
          { value: "advanced", label: t.train_exp_advanced },
        ]} />
      </Field>

      <Field label={t.train_equipment}>
        <SegmentGroup value={equipment} onChange={setEquipment} options={[
          { value: "home", label: t.ex_tab_home }, { value: "gym", label: t.ex_tab_gym },
        ]} />
      </Field>

      <Field label={t.train_days}>
        <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginBottom: 8, marginTop: -6 }}>{t.train_days_hint}</div>
        <WeekdayToggle value={weekdays} onChange={setWeekdays} />
      </Field>

      <Field label={t.train_focus}>
        <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginBottom: 8, marginTop: -6 }}>{t.train_focus_hint}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {[
            { value: "whole", label: t.train_focus_whole },
            { value: "shoulders", label: t.train_focus_shoulders },
            { value: "arms", label: t.train_focus_arms },
            { value: "chest", label: t.train_focus_chest },
            { value: "back", label: t.train_focus_back },
            { value: "core", label: t.train_focus_core },
            { value: "legs", label: t.train_focus_legs },
          ].map((opt) => {
            const active = opt.value === "whole" ? focusAreas.length === 0 : focusAreas.includes(opt.value);
            return (
              <button key={opt.value} type="button" onClick={() => toggleFocusArea(opt.value)} style={{
                textAlign: "start", padding: "12px 13px", borderRadius: 11, cursor: "pointer",
                border: `1.5px solid ${active ? TOKENS.herb : TOKENS.line}`,
                background: active ? TOKENS.herb : TOKENS.paperRaised,
                color: active ? TOKENS.cream : TOKENS.ink,
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, transition: "all .15s ease",
              }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t.train_meal_style}>
        <SegmentGroup value={mealStyle} onChange={setMealStyle} options={[
          { value: "mix", label: t.train_meal_style_mix },
          { value: "kurdish", label: t.train_meal_style_kurdish },
        ]} />
      </Field>

      <Field label={t.train_supplement}>
        <SegmentGroup columns={3} value={supplement} onChange={pickSupplement} options={[
          { value: "none", label: t.train_supplement_none },
          { value: "whey", label: t.train_supplement_whey },
          { value: "gainer", label: t.train_supplement_gainer },
        ]} />
        {supplement !== "none" && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: TOKENS.inkSoft, marginBottom: 5, fontWeight: 600 }}>{t.train_supplement_servings}</div>
                <input
                  type="number" inputMode="numeric" min="1" max="6" value={supplementServings}
                  onChange={(e) => setSupplementServings(e.target.value)}
                  style={{ ...inputStyle, padding: "9px 10px", fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: TOKENS.inkSoft, marginBottom: 5, fontWeight: 600 }}>{t.train_supplement_protein_label}</div>
                <input
                  type="number" inputMode="numeric" min="0" max="200" value={servingProtein}
                  onChange={(e) => setServingProtein(e.target.value)}
                  style={{ ...inputStyle, padding: "9px 10px", fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: TOKENS.inkSoft, marginBottom: 5, fontWeight: 600 }}>{t.train_supplement_calories_label}</div>
                <input
                  type="number" inputMode="numeric" min="0" max="2000" value={servingCalories}
                  onChange={(e) => setServingCalories(e.target.value)}
                  style={{ ...inputStyle, padding: "9px 10px", fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 8, lineHeight: 1.5 }}>{t.train_supplement_note}</div>
          </div>
        )}
      </Field>

      {error && <div style={{ color: TOKENS.clay, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <Button variant="saffron" full onClick={submit} disabled={generating} style={{ marginTop: 6 }}>
        {generating ? <><Loader2 size={16} className="spin" /> {t.train_generating}</> : <><Dumbbell size={16} /> {t.train_generate}</>}
      </Button>
    </div>
  );
}

function currentTrainingWeek(startDate) {
  const start = new Date(startDate + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return clamp(Math.floor(diffDays / 7) + 1, 1, 5);
}

function SwapExerciseModal({ exerciseName, equipment, onClose, onPick }) {
  const t = useT();
  const [alts, setAlts] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await generateExerciseAlternatives({ exerciseName, equipment });
        if (cancelled) return;
        const list = (r.alternatives || []).map((a) => ({
          name: a.name || "Exercise", sets: Number(a.sets) || 3, reps: a.reps || "8-12",
        }));
        setAlts(list);
        if (!list.length) setErrMsg(t.train_swap_fail);
      } catch (e) {
        if (!cancelled) setErrMsg(`${t.train_swap_fail} (${e.message || e})`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal title={t.train_swap_title} onClose={onClose}>
      <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 14 }}>{t.train_swap_sub} <span style={{ fontWeight: 700, color: TOKENS.ink }}>{exerciseName}</span></div>
      {alts === null && !errMsg && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 0", color: TOKENS.inkSoft, fontSize: 13.5 }}>
          <Loader2 size={16} className="spin" /> {t.train_swap_loading}
        </div>
      )}
      {errMsg && (
        <div style={{ color: TOKENS.clay, fontSize: 13, marginBottom: 10 }}>{errMsg}</div>
      )}
      {alts && alts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alts.map((a, i) => (
            <button key={i} onClick={() => onPick(a)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              background: TOKENS.paperRaised, border: `1.5px solid ${TOKENS.line}`, borderRadius: 12,
              padding: "12px 14px", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-body)",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{a.name}</span>
              <span style={{ fontSize: 12, color: TOKENS.inkSoft, flexShrink: 0 }}>{a.sets} {t.train_sets} × {a.reps} {t.train_reps}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function SwapMealModal({ mealIdea, mealType, calories, proteinG, goal, onClose, onPick }) {
  const t = useT();
  const [alts, setAlts] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const mealTypeLabel = { breakfast: t.meal_breakfast, lunch: t.meal_lunch, dinner: t.meal_dinner, snack: t.meal_snack }[mealType] || mealType;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await generateMealAlternatives({ mealIdea, mealType: mealTypeLabel, calories, proteinG, goal });
        if (cancelled) return;
        const list = (r.alternatives || []).map((a) => ({
          idea: a.idea || "Meal", calories: Math.round(a.calories) || 0, protein_g: Math.round(a.protein_g) || 0,
        }));
        setAlts(list);
        if (!list.length) setErrMsg(t.train_swap_fail);
      } catch (e) {
        if (!cancelled) setErrMsg(`${t.train_swap_fail} (${e.message || e})`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal title={t.train_swap_meal_title} onClose={onClose}>
      <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 14 }}>{t.train_swap_sub} <span style={{ fontWeight: 700, color: TOKENS.ink }}>{mealIdea}</span></div>
      {alts === null && !errMsg && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 0", color: TOKENS.inkSoft, fontSize: 13.5 }}>
          <Loader2 size={16} className="spin" /> {t.train_swap_loading}
        </div>
      )}
      {errMsg && (
        <div style={{ color: TOKENS.clay, fontSize: 13, marginBottom: 10 }}>{errMsg}</div>
      )}
      {alts && alts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alts.map((a, i) => (
            <button key={i} onClick={() => onPick(a)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              background: TOKENS.paperRaised, border: `1.5px solid ${TOKENS.line}`, borderRadius: 12,
              padding: "12px 14px", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-body)",
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.ink, flex: 1 }}>{a.idea}</span>
              <span style={{ fontSize: 12, color: TOKENS.inkSoft, flexShrink: 0, textAlign: "end", marginInlineStart: 10 }}>
                {a.calories} {t.unit_kcal}<br />{a.protein_g}{t.macro_protein[0]}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function TrainingPlanDisplay({ plan, profile, onRegenerate, onUpdatePlan, todayLog, onCompleteWorkout, onAddMealIdea }) {
  const t = useT();
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null);
  const [mealSwapTarget, setMealSwapTarget] = useState(null);
  const [loggingWorkout, setLoggingWorkout] = useState(false);
  const [workoutMinutes, setWorkoutMinutes] = useState(45);
  const [addedMeals, setAddedMeals] = useState(() => new Set());
  const week = currentTrainingWeek(plan.startDate);
  const done = week > 4;
  const [activeWeek, setActiveWeek] = useState(Math.min(week, 4));
  const exLabel = {
    walking: t.ex_walking, running: t.ex_running, cycling: t.ex_cycling, swimming: t.ex_swimming,
    treadmill: t.ex_treadmill, stationaryBike: t.ex_stationaryBike, rowingMachine: t.ex_rowing,
    weightTraining: t.ex_weights, jumpRope: t.ex_jumpRope, hiit: t.ex_hiit, dancing: t.ex_dancing,
  };
  const weekdayLabel = { monday: t.weekdaysShort[0], tuesday: t.weekdaysShort[1], wednesday: t.weekdaysShort[2], thursday: t.weekdaysShort[3], friday: t.weekdaysShort[4], saturday: t.weekdaysShort[5], sunday: t.weekdaysShort[6] };
  const focusLabel = {
    shoulders: t.train_focus_shoulders, arms: t.train_focus_arms, chest: t.train_focus_chest,
    back: t.train_focus_back, core: t.train_focus_core, legs: t.train_focus_legs,
  };
  const orderedDays = WEEKDAY_KEYS.filter((d) => (plan.days || []).some((x) => x.weekday === d))
    .map((d) => (plan.days || []).find((x) => x.weekday === d));
  const progressionNote = (plan.progression || []).find((p) => p.week === activeWeek);

  const [selectedWeekday, setSelectedWeekday] = useState(todayWeekdayKey());
  const todayWorkout = (plan.days || []).find((d) => d.weekday === selectedWeekday);
  const workoutAlreadyLogged = !!(todayWorkout && (todayLog?.exercises || []).some((e) => e.type === todayWorkout.title));
  function confirmCompleteWorkout() {
    const minutes = Math.max(5, Number(workoutMinutes) || 45);
    const caloriesBurned = Math.round(burnRatePerMin("weightTraining", (profile && profile.weight) || 75) * minutes);
    onCompleteWorkout({ id: uid(), type: todayWorkout.title, minutes, caloriesBurned, at: Date.now() });
    setLoggingWorkout(false);
  }
  function addMealIdeaToToday(dayIndex, mealIndex, m) {
    const { carbs, fat } = estimateMacrosFromCalProtein(m.calories || 0, m.protein_g || 0);
    onAddMealIdea({ id: uid(), type: m.type, name: m.idea, calories: m.calories || 0, protein: m.protein_g || 0, carbs, fat, at: Date.now() });
    setAddedMeals((prev) => new Set(prev).add(`${dayIndex}-${mealIndex}`));
  }

  return (
    <div>
      {orderedDays.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>
          {orderedDays.map((d) => (
            <button
              key={d.weekday} onClick={() => setSelectedWeekday(d.weekday)}
              style={{
                padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                border: `1.5px solid ${selectedWeekday === d.weekday ? TOKENS.herb : TOKENS.line}`,
                background: selectedWeekday === d.weekday ? TOKENS.herb : "transparent",
                color: selectedWeekday === d.weekday ? TOKENS.cream : TOKENS.ink,
                cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0,
              }}
            >
              {weekdayLabel[d.weekday]}{d.weekday === todayWeekdayKey() ? " •" : ""}
            </button>
          ))}
        </div>
      )}

      {todayWorkout && (
        <div style={{ background: `${TOKENS.herb}14`, border: `1px solid ${TOKENS.herb}44`, borderRadius: 14, padding: "13px 15px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: workoutAlreadyLogged || loggingWorkout ? 10 : 0 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.herbDeep, textTransform: "uppercase" }}>
                {selectedWeekday === todayWeekdayKey() ? t.train_today_workout : weekdayLabel[selectedWeekday]}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: TOKENS.ink, marginTop: 2 }}>{todayWorkout.title}</div>
            </div>
            {workoutAlreadyLogged ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: TOKENS.herbDeep, flexShrink: 0 }}>
                <Check size={15} /> {t.train_workout_completed}
              </div>
            ) : !loggingWorkout && (
              <Button variant="saffron" style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0 }} onClick={() => setLoggingWorkout(true)}>
                {t.train_mark_complete}
              </Button>
            )}
          </div>
          {!workoutAlreadyLogged && loggingWorkout && (
            <div>
              <div style={{ fontSize: 12.5, color: TOKENS.ink, marginBottom: 8 }}>{t.train_workout_duration_label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number" inputMode="numeric" value={workoutMinutes} onChange={(e) => setWorkoutMinutes(e.target.value)}
                  style={{ ...inputStyle, padding: "8px 10px", fontSize: 13.5, flex: 1 }}
                />
                <Button variant="ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setLoggingWorkout(false)}>{t.cancel}</Button>
                <Button variant="primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={confirmCompleteWorkout}>{t.ex_logOneClick}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {done && (
        <div style={{ background: `${TOKENS.saffron}22`, border: `1px solid ${TOKENS.saffron}55`, borderRadius: 14, padding: "13px 15px", marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, color: TOKENS.herbDeep, fontWeight: 600, marginBottom: 10 }}>{t.train_plan_done}</div>
          <Button variant="saffron" onClick={onRegenerate}><RefreshCw size={15} /> {t.train_regenerate}</Button>
        </div>
      )}

      {plan.summary && (
        <div style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.herbDeep, marginBottom: 4 }}>{plan.splitName || t.train_your_split}</div>
          <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, lineHeight: 1.5 }}>{plan.summary}</div>
          {plan.focusAreas && plan.focusAreas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
              {plan.focusAreas.map((f) => (
                <div key={f} style={{ fontSize: 11.5, fontWeight: 700, color: TOKENS.herbDeep, background: `${TOKENS.herb}1a`, padding: "4px 10px", borderRadius: 999 }}>
                  {t.train_focus_badge}: {focusLabel[f] || f}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[1, 2, 3, 4].map((w) => (
          <button key={w} onClick={() => setActiveWeek(w)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-body)",
            border: `1.5px solid ${activeWeek === w ? TOKENS.herb : TOKENS.line}`,
            background: activeWeek === w ? TOKENS.herb : TOKENS.paperRaised,
            color: activeWeek === w ? TOKENS.cream : TOKENS.ink, fontSize: 12.5, fontWeight: 700, position: "relative",
          }}>
            {t.train_week} {w}
            {week === w && !done && (
              <span style={{ position: "absolute", top: -3, insetInlineEnd: -3, width: 8, height: 8, borderRadius: 999, background: TOKENS.saffron, border: `1.5px solid ${TOKENS.paper}` }} />
            )}
          </button>
        ))}
      </div>
      {progressionNote && (
        <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginBottom: 16, lineHeight: 1.5, paddingInlineStart: 2 }}>
          <span style={{ fontWeight: 700, color: TOKENS.ink }}>{t.train_progression}: </span>{progressionNote.note}
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 15, color: TOKENS.ink, marginBottom: 10 }}>{t.train_your_split}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {orderedDays.map((d) => (
          <div key={d.weekday} style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: "13px 15px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.saffronDeep, textTransform: "uppercase" }}>{weekdayLabel[d.weekday]}</span>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: TOKENS.ink }}>{d.title}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(d.exercises || []).map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " exercise proper form")}`}
                    target="_blank" rel="noopener noreferrer" title={t.train_watch_how}
                    style={{
                      width: 40, height: 40, borderRadius: 10, background: `${TOKENS.herb}14`, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
                    }}
                  >
                    <PlayCircle size={19} color={TOKENS.herbDeep} style={{ pointerEvents: "none" }} />
                  </a>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: TOKENS.ink }}>{ex.name}</span>
                    <span style={{ fontSize: 12, color: TOKENS.inkSoft, flexShrink: 0 }}>{ex.sets} {t.train_sets} × {ex.reps} {t.train_reps}</span>
                  </div>
                  <button
                    onClick={() => setSwapTarget({ weekday: d.weekday, index: i, name: ex.name })}
                    title={t.train_swap_action}
                    style={{
                      width: 30, height: 30, borderRadius: 999, background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={13} color={TOKENS.inkSoft} style={{ pointerEvents: "none" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {swapTarget && (
        <SwapExerciseModal
          exerciseName={swapTarget.name} equipment={plan.equipment}
          onClose={() => setSwapTarget(null)}
          onPick={(alt) => {
            const nextDays = (plan.days || []).map((day) => {
              if (day.weekday !== swapTarget.weekday) return day;
              const nextExercises = (day.exercises || []).map((ex, i) => (i === swapTarget.index ? alt : ex));
              return { ...day, exercises: nextExercises };
            });
            onUpdatePlan({ ...plan, days: nextDays });
            setSwapTarget(null);
          }}
        />
      )}

      {plan.mealIdeas && plan.mealIdeas.length > 0 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 15, color: TOKENS.ink, marginBottom: 3 }}>{t.train_meal_ideas}</div>
          <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginBottom: plan.mealCalorieTarget ? 2 : 10 }}>{t.train_meal_ideas_sub}</div>
          {plan.mealCalorieTarget && (
            <div style={{ fontSize: 12, color: TOKENS.herbDeep, fontWeight: 600, marginBottom: plan.supplement && plan.supplement !== "none" ? 4 : 10 }}>
              {t.train_meal_sized_to} ~{plan.mealCalorieTarget} {t.unit_kcal}/{t.train_per_day}
              {typeof plan.mealProteinTarget === "number" && <> · {plan.mealProteinTarget}g {t.macro_protein}</>}
              {" "}({t[GOAL_LABEL_KEY[plan.goal]] || plan.goal})
            </div>
          )}
          {plan.supplement && plan.supplement !== "none" && (
            <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 10, lineHeight: 1.5 }}>
              {t.train_supplement_summary
                .replace("{servings}", plan.supplementServings)
                .replace("{type}", plan.supplement === "whey" ? t.train_supplement_whey : t.train_supplement_gainer)
                .replace("{protein}", plan.supplementProtein)
                .replace("{cal}", plan.supplementCalories)
                .replace("{totalCal}", plan.dailyCalorieTarget)
                .replace("{totalProtein}", plan.dailyProteinTarget)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {plan.mealIdeas.map((day, i) => (
              <div key={i} style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: "13px 15px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: TOKENS.herbDeep, marginBottom: 8 }}>
                  {t.train_meal_day} {i + 1}{day.style ? ` – ${day.style}` : ""}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(day.meals || []).map((m, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12.5, color: TOKENS.ink }}>
                      <span style={{ flex: 1, minWidth: 0 }}><span style={{ color: TOKENS.inkSoft }}>{{ breakfast: t.meal_breakfast, lunch: t.meal_lunch, dinner: t.meal_dinner, snack: t.meal_snack }[m.type] || m.type}:</span> {m.idea}</span>
                      <span style={{ color: TOKENS.inkSoft, flexShrink: 0, textAlign: "end" }}>
                        {m.calories} {t.unit_kcal}{typeof m.protein_g === "number" ? <><br />{m.protein_g}{t.macro_protein[0]}</> : null}
                      </span>
                      <button
                        onClick={() => addMealIdeaToToday(i, j, m)}
                        disabled={addedMeals.has(`${i}-${j}`)}
                        title={t.train_meal_add}
                        style={{
                          width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                          background: addedMeals.has(`${i}-${j}`) ? `${TOKENS.herb}22` : TOKENS.paper,
                          border: `1px solid ${addedMeals.has(`${i}-${j}`) ? TOKENS.herb : TOKENS.line}`,
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: addedMeals.has(`${i}-${j}`) ? "default" : "pointer",
                        }}
                      >
                        {addedMeals.has(`${i}-${j}`)
                          ? <Check size={13} color={TOKENS.herbDeep} style={{ pointerEvents: "none" }} />
                          : <Plus size={13} color={TOKENS.inkSoft} style={{ pointerEvents: "none" }} />}
                      </button>
                      <button
                        onClick={() => setMealSwapTarget({ dayIndex: i, mealIndex: j, idea: m.idea, type: m.type, calories: m.calories, protein_g: m.protein_g })}
                        title={t.train_swap_meal_action}
                        style={{
                          width: 26, height: 26, borderRadius: 999, background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}
                      >
                        <RefreshCw size={12} color={TOKENS.inkSoft} style={{ pointerEvents: "none" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {mealSwapTarget && (
            <SwapMealModal
              mealIdea={mealSwapTarget.idea} mealType={mealSwapTarget.type}
              calories={mealSwapTarget.calories} proteinG={mealSwapTarget.protein_g} goal={plan.goal}
              onClose={() => setMealSwapTarget(null)}
              onPick={(alt) => {
                const nextMealIdeas = (plan.mealIdeas || []).map((day, di) => {
                  if (di !== mealSwapTarget.dayIndex) return day;
                  const nextMeals = (day.meals || []).map((m, mi) => (
                    mi === mealSwapTarget.mealIndex ? { ...m, idea: alt.idea, calories: alt.calories, protein_g: alt.protein_g } : m
                  ));
                  return { ...day, meals: nextMeals };
                });
                onUpdatePlan({ ...plan, mealIdeas: nextMealIdeas });
                setMealSwapTarget(null);
              }}
            />
          )}
        </>
      )}

      <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, textAlign: "center", marginBottom: 14, lineHeight: 1.5 }}>{t.train_safety_note}</div>

      {!done && !confirmRegen && (
        <Button variant="ghost" full onClick={() => setConfirmRegen(true)}><RefreshCw size={15} /> {t.train_regenerate}</Button>
      )}
      {confirmRegen && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: TOKENS.ink, marginBottom: 10 }}>{t.train_regenerate_confirm}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="subtle" full onClick={() => setConfirmRegen(false)}>{t.cancel}</Button>
            <Button variant="danger" full onClick={onRegenerate}>{t.train_regenerate}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderChatInline(line, keyPrefix) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`} style={{ unicodeBidi: "isolate" }}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}
function renderChatText(text) {
  const lines = (text || "").split("\n");
  const elements = [];
  let listBuffer = [];
  function flushList(key) {
    if (listBuffer.length) {
      elements.push(
        <ul key={`ul-${key}`} style={{ margin: "2px 0 6px", paddingInlineStart: 18 }}>
          {listBuffer.map((item, i) => <li key={i} style={{ marginBottom: 2 }}>{renderChatInline(item, `li-${key}-${i}`)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  }
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
    } else {
      flushList(i);
      if (trimmed === "") elements.push(<div key={i} style={{ height: 6 }} />);
      else elements.push(<div key={i} style={{ marginBottom: 2 }}>{renderChatInline(trimmed, `p-${i}`)}</div>);
    }
  });
  flushList("end");
  return elements;
}

function TrainerChatModal({ profile, plan, lang, onClose }) {
  const t = useT();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadTrainerChat();
      if (!cancelled) setMessages(stored && stored.length ? stored : []);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput(""); setError("");
    const userMsg = { role: "user", content: text, id: uid() };
    const nextMessages = [...(messages || []), userMsg];
    setMessages(nextMessages);
    setSending(true);
    insertTrainerMessage(userMsg);
    try {
      const contextText = buildTrainerContext(profile, plan);
      const reply = await askTrainer(nextMessages.map((m) => ({ role: m.role, content: m.content })), contextText, lang);
      const assistantMsg = { role: "assistant", content: reply, id: uid() };
      setMessages([...nextMessages, assistantMsg]);
      insertTrainerMessage(assistantMsg);
    } catch (e) {
      setError(`${t.train_chat_error} (${e.message || e})`);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal title={t.train_chat_title} onClose={onClose}>
      <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 12, lineHeight: 1.4 }}>{t.train_chat_disclaimer}</div>
      <div ref={scrollRef} style={{ maxHeight: "50vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {messages === null && (
          <div style={{ textAlign: "center", padding: "20px 0" }}><Loader2 size={16} className="spin" color={TOKENS.inkSoft} /></div>
        )}
        {messages && messages.length === 0 && (
          <div style={{ fontSize: 13, color: TOKENS.inkSoft, textAlign: "center", padding: "16px 10px" }}>{t.train_chat_intro}</div>
        )}
        {messages && messages.map((m) => (
          <div key={m.id} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%", background: m.role === "user" ? TOKENS.herb : TOKENS.paperRaised,
            color: m.role === "user" ? TOKENS.cream : TOKENS.ink,
            border: m.role === "user" ? "none" : `1px solid ${TOKENS.line}`,
            borderRadius: 14, padding: "9px 13px", fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap",
          }}>
            {m.role === "user" ? m.content : renderChatText(m.content)}
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: TOKENS.inkSoft, fontSize: 12.5 }}>
            <Loader2 size={14} className="spin" /> {t.train_chat_typing}
          </div>
        )}
      </div>
      {error && <div style={{ color: TOKENS.clay, fontSize: 12.5, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={t.train_chat_placeholder}
          style={{ ...inputStyle, flex: 1, padding: "11px 14px" }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{
          width: 44, height: 44, borderRadius: 12, background: TOKENS.herb, border: "none", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: (sending || !input.trim()) ? 0.5 : 1,
        }}>
          <Send size={18} color={TOKENS.cream} />
        </button>
      </div>
    </Modal>
  );
}

function TrainingView({ profile, plan, onSavePlan, onUpdateWaist, lang, todayLog, onCompleteWorkout, onAddMealIdea }) {
  const t = useT();
  const [regenerating, setRegenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const showSetup = !plan || regenerating;

  useEffect(() => {
    if (!plan) return;
    const planLang = plan.contentLang || "en";
    if (planLang === lang || translating) return;
    let cancelled = false;
    setTranslating(true);
    (async () => {
      try {
        const translated = await translatePlanText(plan, lang);
        if (cancelled) return;
        onSavePlan({ ...applyTranslatedPlanText(plan, translated), contentLang: lang });
      } catch (e) {
        // translation failed — leave existing content as-is rather than blocking the screen
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.contentLang, lang, plan]);

  return (
    <Screen>
      {showSetup ? (
        <TrainingSetup profile={profile} onGenerate={(p) => { onSavePlan(p); setRegenerating(false); }} onUpdateWaist={onUpdateWaist} lang={lang} />
      ) : (
        <>
          {translating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${TOKENS.saffron}22`, border: `1px solid ${TOKENS.saffron}55`, borderRadius: 12, padding: "10px 13px", marginBottom: 14, fontSize: 13, color: TOKENS.ink }}>
              <Loader2 size={15} className="spin" /> {t.train_translating}
            </div>
          )}
          <TrainingPlanDisplay
            plan={plan} profile={profile} onRegenerate={() => setRegenerating(true)} onUpdatePlan={onSavePlan}
            todayLog={todayLog} onCompleteWorkout={onCompleteWorkout} onAddMealIdea={onAddMealIdea}
          />
        </>
      )}

      {!showSetup && (
        <div style={{ position: "fixed", bottom: 78, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ maxWidth: 480, width: "100%", position: "relative" }}>
            <button onClick={() => setChatOpen(true)} title={t.train_chat_title} style={{
              position: "absolute", bottom: 0, insetInlineEnd: 20,
              width: 54, height: 54, borderRadius: 999, background: TOKENS.saffron, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(184,134,47,.4)",
              pointerEvents: "auto",
            }}>
              <MessageCircle size={22} color={TOKENS.herbDeep} />
            </button>
          </div>
        </div>
      )}

      {chatOpen && <TrainerChatModal profile={profile} plan={plan} lang={lang} onClose={() => setChatOpen(false)} />}
    </Screen>
  );
}

/* ============================== NAV ============================== */
function BottomNav({ view, setView }) {
  const t = useT();
  const items = [
    { key: "today", label: t.nav_today, icon: Flame },
    { key: "training", label: t.nav_training, icon: Dumbbell },
    { key: "reports", label: t.nav_reports, icon: TrendingUp },
    { key: "settings", label: t.nav_settings, icon: SettingsIcon },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, background: TOKENS.paperRaised,
      borderTop: `1px solid ${TOKENS.line}`, display: "flex", justifyContent: "center", zIndex: 30,
    }}>
      <div style={{ maxWidth: 480, width: "100%", display: "flex" }}>
        {items.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button key={key} onClick={() => setView(key)} style={{
              flex: 1, background: "none", border: "none", padding: "11px 0 9px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              color: active ? TOKENS.herbDeep : TOKENS.inkSoft,
            }}>
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
export default function App() {
  const [lang, setLang] = useState("en");
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState({});
  const [foodCache, setFoodCache] = useState({});
  const [view, setView] = useState("today");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [ready, setReady] = useState(false);
  const [viewedISO, setViewedISO] = useState(todayISO());
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [todayDate, setTodayDate] = useState(todayISO());

  // Any day that's now in the past and was never explicitly closed gets
  // auto-closed (both locally and in the DB) so a forgotten day doesn't
  // stay editable forever. Reopening it (via the existing Reopen button)
  // still works, but it auto-closes again the next time the date rolls over.
  function autoCloseOverdueDays(logsSnapshot, currentToday) {
    const overdue = Object.entries(logsSnapshot).filter(([date, day]) => date < currentToday && !day.closed);
    if (!overdue.length) return;
    overdue.forEach(([date]) => setDayClosed(date, true));
    setLogs((prev) => {
      const next = { ...prev };
      overdue.forEach(([date]) => { next[date] = { ...(next[date] || emptyDay()), closed: true }; });
      return next;
    });
  }

  useEffect(() => {
    injectFonts();
    (async () => {
      const [p, l, la, fc, tp] = await Promise.all([
        loadProfile(), loadLogs(), loadLang(), loadFoodCache(), loadTrainingPlan(),
      ]);
      if (p) setProfile(p);
      if (l) setLogs(l);
      if (la) setLang(la);
      if (fc) setFoodCache(fc);
      if (tp) setTrainingPlan(tp);
      setReady(true);
      if (l) autoCloseOverdueDays(l, todayISO());
    })();
  }, []);

  // Detect the date rolling over past midnight while the app stays open,
  // and auto-close whatever day just became "yesterday".
  const logsRef = useRef(logs);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => {
    const interval = setInterval(() => {
      const nowISO = todayISO();
      if (nowISO !== todayDate) {
        setTodayDate(nowISO);
        autoCloseOverdueDays(logsRef.current, nowISO);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayDate]);

  const t = DICT[lang];
  const today = todayDate;
  const log = logs[viewedISO] || { meals: [], exercises: [], closed: false };

  function cacheEntriesFor(meals) {
    let nextCache = foodCache;
    let changed = false;
    meals.forEach((meal) => {
      const key = normalizeFoodName(meal.name);
      if (!key) return;
      const prev = nextCache[key];
      nextCache = { ...nextCache, [key]: {
        name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
        count: (prev ? prev.count : 0) + 1, lastAt: Date.now(),
      } };
      changed = true;
      upsertFoodCacheEntry(meal);
    });
    if (changed) setFoodCache(nextCache);
  }

  async function handleAddMeal(meal) {
    const id = await insertMealRow(viewedISO, meal);
    if (!id) return;
    const savedMeal = { ...meal, id };
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, meals: [...(day.meals || []), savedMeal] } };
    });
    cacheEntriesFor([savedMeal]);
  }
  async function handleAddMeals(meals) {
    if (!meals.length) return;
    const saved = [];
    for (const meal of meals) {
      const id = await insertMealRow(viewedISO, meal);
      if (id) saved.push({ ...meal, id });
    }
    if (!saved.length) return;
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, meals: [...(day.meals || []), ...saved] } };
    });
    cacheEntriesFor(saved);
  }
  async function handleAddExercise(ex) {
    const id = await insertExerciseRow(viewedISO, ex);
    if (!id) return;
    const savedEx = { ...ex, id };
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, exercises: [...(day.exercises || []), savedEx] } };
    });
  }
  function handleDeleteMeal(mealId) {
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, meals: (day.meals || []).filter((m) => m.id !== mealId) } };
    });
    deleteMealRow(mealId);
  }
  function handleDeleteExercise(exId) {
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, exercises: (day.exercises || []).filter((e) => e.id !== exId) } };
    });
    deleteExerciseRow(exId);
  }
  async function handleCompleteWorkout(entry) {
    const id = await insertExerciseRow(today, entry);
    if (!id) return;
    const savedEx = { ...entry, id };
    setLogs((prev) => {
      const day = prev[today] || { meals: [], exercises: [], closed: false };
      return { ...prev, [today]: { ...day, closed: false, exercises: [...(day.exercises || []), savedEx] } };
    });
  }
  async function handleAddMealFromIdea(meal) {
    const id = await insertMealRow(today, meal);
    if (!id) return;
    const savedMeal = { ...meal, id };
    setLogs((prev) => {
      const day = prev[today] || { meals: [], exercises: [], closed: false };
      return { ...prev, [today]: { ...day, closed: false, meals: [...(day.meals || []), savedMeal] } };
    });
    cacheEntriesFor([savedMeal]);
  }
  function handleCloseDay() {
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, closed: true } };
    });
    setDayClosed(viewedISO, true);
    setShowSummary(true);
  }
  function handleReopenDay() {
    setLogs((prev) => {
      const day = prev[viewedISO] || { meals: [], exercises: [], closed: false };
      return { ...prev, [viewedISO]: { ...day, closed: false } };
    });
    setDayClosed(viewedISO, false);
    setShowSummary(false);
  }
  function handleLangChange(l) {
    setLang(l);
    saveLang(l);
  }
  function handleProfileSaved(p) {
    setProfile(p);
    saveProfile(p);
    setEditingProfile(false);
    setView("today");
  }
  async function handleSaveTrainingPlan(plan) {
    setTrainingPlan(plan);
    const id = await saveTrainingPlan(plan);
    if (id && id !== plan._id) setTrainingPlan((prev) => (prev ? { ...prev, _id: id } : prev));
  }
  function handleUpdateWaist(waistCm) {
    const next = { ...profile, waist: waistCm };
    setProfile(next);
    saveProfile(next);
  }

  const dir = t.dir;

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: TOKENS.herbDeep }}>
        <Loader2 className="spin" size={26} />
      </div>
    );
  }

  return (
    <I18nContext.Provider value={t}>
      <div dir={dir} style={{
        "--font-body": t.fontBody, "--font-display": t.fontDisplay,
        background: TOKENS.paper, color: TOKENS.ink, minHeight: "100vh",
        fontFamily: "var(--font-body)", position: "relative",
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
          input:focus { border-color: ${TOKENS.herb} !important; }
          * { box-sizing: border-box; }
          html, body { background: ${TOKENS.paper}; margin: 0; padding: 0; min-height: 100%; width: 100%; overflow-x: hidden; }
          button svg, a svg { pointer-events: none; }
          input, select, textarea { font-size: 16px !important; }
        `}</style>

        <div style={{ padding: "18px 18px 0", maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: TOKENS.herb, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={18} color={TOKENS.saffron} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: TOKENS.herbDeep, lineHeight: 1.1 }}>{t.appName}</div>
              <div style={{ fontSize: 10.5, color: TOKENS.inkSoft }}>{t.tagline}</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              title={t.settings_language}
              style={{
                width: 34, height: 34, borderRadius: 999, background: "transparent", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}
            >
              <Globe size={17} color={TOKENS.inkSoft} style={{ pointerEvents: "none" }} />
            </button>
            {langMenuOpen && (
              <>
                <div onClick={() => setLangMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", insetInlineEnd: 0, zIndex: 61,
                  background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(30,30,20,.14)", minWidth: 160, overflow: "hidden",
                }}>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { handleLangChange(l.code); setLangMenuOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                        padding: "10px 13px", background: l.code === lang ? `${TOKENS.herb}14` : "transparent", border: "none",
                        cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5,
                        color: l.code === lang ? TOKENS.herbDeep : TOKENS.ink, fontWeight: l.code === lang ? 700 : 500,
                      }}
                    >
                      <span style={{ pointerEvents: "none" }}>{l.label}</span>
                      {l.code === lang && <Check size={14} color={TOKENS.herbDeep} style={{ pointerEvents: "none" }} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(!profile || editingProfile) ? (
          <Onboarding
            existing={editingProfile ? profile : null}
            onSaved={handleProfileSaved}
            onCancel={editingProfile ? () => setEditingProfile(false) : null}
          />
        ) : (
          <>
            {view === "today" && (
              <TodayView
                profile={profile} log={log} foodCache={foodCache}
                viewedISO={viewedISO} onChangeDate={setViewedISO} logs={logs}
                onAddMeal={handleAddMeal} onAddMeals={handleAddMeals} onAddExercise={handleAddExercise}
                onDeleteMeal={handleDeleteMeal} onDeleteExercise={handleDeleteExercise}
                onCloseDay={handleCloseDay} onOpenSummary={() => setShowSummary(true)}
              />
            )}
            {view === "reports" && <ReportsView logs={logs} target={profile.calorieTarget} />}
            {view === "training" && (
              <TrainingView
                profile={profile} plan={trainingPlan}
                onSavePlan={handleSaveTrainingPlan}
                onUpdateWaist={handleUpdateWaist} lang={lang}
                todayLog={logs[today] || { meals: [], exercises: [], closed: false }}
                onCompleteWorkout={handleCompleteWorkout} onAddMealIdea={handleAddMealFromIdea}
              />
            )}
            {view === "settings" && (
              <SettingsView lang={lang} onLangChange={handleLangChange} onEditProfile={() => setEditingProfile(true)} />
            )}
            <BottomNav view={view} setView={setView} />
          </>
        )}

        {showSummary && profile && (
          <DaySummaryModal
            onClose={() => setShowSummary(false)}
            onReopen={(log.closed || viewedISO < today) ? handleReopenDay : null}
            target={profile.calorieTarget}
            consumed={(log.meals || []).reduce((s, m) => s + m.calories, 0)}
            burned={(log.exercises || []).reduce((s, e) => s + e.caloriesBurned, 0)}
            mealsCount={(log.meals || []).length}
            exCount={(log.exercises || []).length}
          />
        )}
      </div>
    </I18nContext.Provider>
  );
}
