import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

export const useModelStore = defineStore("model", () => {
  let models: Ref<any[]> = ref([]);
  return { models };
});
