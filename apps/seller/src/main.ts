import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { applySavedTheme } from "@bazaarx/ui";
import "./style.css";
import "@bazaarx/ui/auth.css";
import "@bazaarx/ui/theme.css";

applySavedTheme();
const app = createApp(App);
app.use(router);
router.isReady().then(() => app.mount("#app"));
