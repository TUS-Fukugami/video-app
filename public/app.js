// サーバと接続開始
const socket = io();

const app = Vue.createApp({
  data() {
    return {
      message: "",
      // メッセージリスト化のために
      messages: [],
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
      // 配列にメッセージを追加
      this.messages.push(msg);
    });
  },
}).mount("#app");
