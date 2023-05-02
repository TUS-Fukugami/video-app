// サーバと接続開始
const socket = io();

const app = Vue.createApp({
  data() {
    return {
      message: "",
    };
  },
  methods: {
    // message送信のメソッド
    sendMessage() {
      // サーバへmessageを送信
      socket.emit("message", this.message);
      this.message = "";
    },
  },
  mounted() {
    // サーバから送信されたmessageを受け取る
    socket.on("message", (msg) => {
      console.log("message: " + msg);
    });
  },
}).mount("#app");
