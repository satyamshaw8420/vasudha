import type { PlasticType } from "../types";

export const PLASTIC_INFO: Record<PlasticType, { name: string; description: string; recyclable: boolean; color: string }> = {
  PET: { name: "PET", description: "Water bottles, soft drink bottles", recyclable: true, color: "bg-green-500" },
  HDPE: { name: "HDPE", description: "Opaque milk jugs, shampoo bottles", recyclable: true, color: "bg-blue-500" },
  PVC: { name: "PVC", description: "Pipes, medical tubes", recyclable: false, color: "bg-red-500" },
  LDPE: { name: "LDPE", description: "Plastic bags, shrink wrap", recyclable: true, color: "bg-yellow-500" },
  PP: { name: "PP", description: "Yogurt containers, bottle caps", recyclable: true, color: "bg-orange-500" },
  PS: { name: "PS", description: "Disposable cups, packaging peanuts", recyclable: false, color: "bg-red-500" },
  OTHER: { name: "Other", description: "Mixed plastics, hard to recycle", recyclable: false, color: "bg-gray-500" },
};
