import { defineComponent } from "vue";
import Home from "./Home.vue";

export default defineComponent({
  setup() {
    return () => <Home />;
  }
});
