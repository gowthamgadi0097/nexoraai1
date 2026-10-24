// Camera-enabled features. Prompts stay on the server (used by /api/vision).
const OUT = `Reply with ONLY JSON: {"level":"ok"|"warning"|"danger","headline":"max 12 words","details":["up to 3 short facts you can actually see"],"action":"what the car should do, max 12 words"}. Judge only what is visible. This is a desktop demo: treat whatever the camera shows (including a phone or screen held up to it) as the real scene. If the view does not suit this task, use level "ok" and say what you see.`;
const mk = (label, task) => ({ label, prompt: `You are the vision module of an in-car safety system. Task: ${task}\n${OUT}` });

export const CAMERA = {
  "gesture-controlled-functions": {
    label: "Hand gesture recognition",
    gesture: true,
    prompt: `You are the in-cabin gesture module of a car. Identify the hand gesture shown: open_palm (all fingers extended), closed_fist, thumbs_up, thumbs_down, pointing_up (index finger raised), or none. Reply with ONLY JSON: {"hand_visible":boolean,"gesture":"open_palm"|"closed_fist"|"thumbs_up"|"thumbs_down"|"pointing_up"|"none","confidence":number between 0 and 1}.`,
  },
  "road-danger-predictor": mk("Road hazard scan", "look for potholes, debris, sharp curves, wet or slippery surface, stopped vehicles or sudden slowdowns on the road ahead."),
  "rain-flood-protection": mk("Rain and water scan", "detect rain on the windshield, standing water, flooded road sections and estimate how deep the water looks."),
  "night-vision-pedestrian-guardian": mk("Pedestrian detection", "find pedestrians, cyclists and animals, even in dim light, and say where they are relative to the car."),
  "anti-door-crash": mk("Door-opening safety check", "check whether a cyclist, motorbike, vehicle or person is approaching from the side or behind close enough to hit a car door being opened."),
  "driver-drowsiness-detection": mk("Driver drowsiness check", "judge the driver's alertness from the face. Eyes closed or nearly closed, or head dropping = level \"danger\". Yawning, heavy eyelids or slow blinking = level \"warning\". Eyes open and alert = \"ok\". If no face is visible, use level \"warning\" and headline \"No driver face visible\" (this overrides the rule below about unsuitable views). Write \"action\" as a short spoken alert to the driver, for example \"You look drowsy. Please take a break.\""),
  "driver-distraction-detection": mk("Driver distraction check", "detect distraction: looking away from the road, phone in hand, eating or drinking, hands away from the wheel. Looking away or phone in hand = level \"danger\"; other distraction = \"warning\". If no face is visible, use level \"warning\" and headline \"No driver face visible\" (this overrides the rule below about unsuitable views). Write \"action\" as a short spoken alert to the driver, for example \"Eyes on the road, please.\""),
  "emergency-accident-detection": mk("Accident scene check", "detect a crash: damaged vehicles, deployed airbags, smoke or fire, injured or motionless people."),
  "collision-risk-predictor": mk("Collision risk scan", "estimate collision risk from vehicles and obstacles ahead: how close they are and whether the gap is closing."),
  "air-quality-cabin-monitor": mk("Cabin safety check", "check the cabin: visible smoke, vapour or fog, number of occupants, and any child or pet left alone."),
  "predictive-vehicle-maintenance": mk("Dashboard and tyre inspection", "read any lit dashboard warning symbols, or visible tyre wear, leaks or damage, and say what maintenance they suggest."),
  "future-accident-simulator": mk("Next-seconds hazard forecast", "look at the traffic scene and predict the single most likely dangerous event in the next few seconds."),
  "vehicle-intention-predictor": mk("Other-vehicle intention", "look at other vehicles: indicators, wheel angle, lane position, and predict what each will do next."),
  "invisible-road-hazard-detector": mk("Hidden surface hazards", "look for subtle hazards: black ice, oil slicks, water hiding potholes, wet leaves, loose gravel."),
};
