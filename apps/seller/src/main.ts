import { createApp } from "vue";
import { router } from "./router";
import "./style.css";
createApp({ template: "<RouterView />" }).use(router).mount("#app");
