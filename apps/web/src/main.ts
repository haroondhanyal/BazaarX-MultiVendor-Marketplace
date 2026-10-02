import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { applySavedTheme } from "@bazaarx/ui";
import "./styles.css";
import "@bazaarx/ui/theme.css";

applySavedTheme();
createApp(App).use(createPinia()).use(router).mount("#app");
